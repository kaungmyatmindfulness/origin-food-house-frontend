//! Print module for native printing support in Tauri.
//!
//! This module provides:
//! - Printer discovery (list available printers)
//! - Silent printing to thermal receipt printers
//! - Cross-platform support (macOS, Windows, Linux)

use serde::{Deserialize, Serialize};
use std::io::Write;
use std::process::Command;
use tempfile::NamedTempFile;

/// Information about an available printer.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrinterInfo {
    /// Printer name (used for printing)
    pub name: String,
    /// Whether this is the default printer
    pub is_default: bool,
    /// Printer description or driver name
    pub description: Option<String>,
    /// Printer status (if available)
    pub status: Option<String>,
}

/// Result of a print operation.
#[derive(Debug, Serialize, Deserialize)]
pub struct PrintResult {
    /// Whether the print was successful
    pub success: bool,
    /// Error message if print failed
    pub error: Option<String>,
    /// Job ID if available (for tracking)
    pub job_id: Option<String>,
}

/// Options for printing.
#[derive(Debug, Deserialize)]
pub struct PrintOptions {
    /// Target printer name (uses default if not specified)
    pub printer: Option<String>,
    /// Number of copies to print
    pub copies: Option<u32>,
    /// Whether to print silently (no dialog)
    pub silent: Option<bool>,
    /// Paper width in mm (default: 80mm for thermal printers)
    pub paper_width: Option<u32>,
}

/// Get list of available printers.
///
/// # Platform Support
/// - macOS/Linux: Uses `lpstat -p -d` command
/// - Windows: Uses PowerShell `Get-Printer` cmdlet
#[tauri::command]
pub async fn get_printers() -> Result<Vec<PrinterInfo>, String> {
    #[cfg(target_os = "windows")]
    {
        get_printers_windows().await
    }

    #[cfg(any(target_os = "macos", target_os = "linux"))]
    {
        get_printers_unix().await
    }
}

/// Print HTML content to a printer.
///
/// The HTML is written to a temporary file and printed using OS-specific commands.
///
/// # Arguments
/// * `html` - The HTML content to print
/// * `options` - Print options (printer, copies, etc.)
///
/// # Platform Support
/// - macOS/Linux: Uses `lp` command with CUPS
/// - Windows: Uses HTML to PDF conversion then prints
#[tauri::command]
pub async fn print_html(html: String, options: Option<PrintOptions>) -> Result<PrintResult, String> {
    let opts = options.unwrap_or(PrintOptions {
        printer: None,
        copies: Some(1),
        silent: Some(true),
        paper_width: Some(80),
    });

    #[cfg(target_os = "windows")]
    {
        print_html_windows(&html, &opts).await
    }

    #[cfg(any(target_os = "macos", target_os = "linux"))]
    {
        print_html_unix(&html, &opts).await
    }
}

// ============================================================================
// Unix (macOS/Linux) Implementation
// ============================================================================

#[cfg(any(target_os = "macos", target_os = "linux"))]
async fn get_printers_unix() -> Result<Vec<PrinterInfo>, String> {
    // Get default printer
    let default_output = Command::new("lpstat")
        .args(["-d"])
        .output()
        .map_err(|e| format!("Failed to get default printer: {}", e))?;

    let default_printer = String::from_utf8_lossy(&default_output.stdout)
        .split(':')
        .nth(1)
        .map(|s| s.trim().to_string())
        .unwrap_or_default();

    // Get all printers
    let output = Command::new("lpstat")
        .args(["-p"])
        .output()
        .map_err(|e| format!("Failed to list printers: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut printers: Vec<PrinterInfo> = Vec::new();

    for line in stdout.lines() {
        // Parse lines like: "printer PrinterName is idle.  enabled since..."
        if line.starts_with("printer ") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                let name = parts[1].to_string();
                let is_default = name == default_printer;
                let status = if line.contains("idle") {
                    Some("idle".to_string())
                } else if line.contains("printing") {
                    Some("printing".to_string())
                } else {
                    None
                };

                printers.push(PrinterInfo {
                    name: name.clone(),
                    is_default,
                    description: None,
                    status,
                });
            }
        }
    }

    // If no printers found via lpstat, try lpinfo
    if printers.is_empty() {
        log::info!("No printers found via lpstat, this may indicate no printers are configured");
    }

    Ok(printers)
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
async fn print_html_unix(html: &str, options: &PrintOptions) -> Result<PrintResult, String> {
    // Create a temporary HTML file
    let mut temp_file = NamedTempFile::new()
        .map_err(|e| format!("Failed to create temp file: {}", e))?;

    // Write HTML content
    temp_file
        .write_all(html.as_bytes())
        .map_err(|e| format!("Failed to write HTML to temp file: {}", e))?;

    // Build lp command arguments
    let mut args: Vec<String> = Vec::new();

    // Specify printer if provided
    if let Some(ref printer) = options.printer {
        args.push("-d".to_string());
        args.push(printer.clone());
    }

    // Number of copies
    let copies = options.copies.unwrap_or(1);
    if copies > 1 {
        args.push("-n".to_string());
        args.push(copies.to_string());
    }

    // Set media size for 80mm thermal paper
    // CUPS uses predefined media names
    let paper_width = options.paper_width.unwrap_or(80);
    if paper_width == 80 {
        args.push("-o".to_string());
        args.push("media=Custom.80x200mm".to_string());
    } else if paper_width == 58 {
        args.push("-o".to_string());
        args.push("media=Custom.58x200mm".to_string());
    }

    // Set print options for thermal printers
    args.push("-o".to_string());
    args.push("fit-to-page".to_string());

    // Add the file path
    args.push(temp_file.path().to_string_lossy().to_string());

    // Execute lp command
    log::info!("Executing lp with args: {:?}", args);
    let output = Command::new("lp")
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute lp command: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        // Try to extract job ID from output like "request id is PrinterName-123 (1 file(s))"
        let job_id = stdout
            .split("request id is ")
            .nth(1)
            .and_then(|s| s.split_whitespace().next())
            .map(|s| s.to_string());

        Ok(PrintResult {
            success: true,
            error: None,
            job_id,
        })
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Ok(PrintResult {
            success: false,
            error: Some(stderr.to_string()),
            job_id: None,
        })
    }
}

// ============================================================================
// Windows Implementation
// ============================================================================

#[cfg(target_os = "windows")]
async fn get_printers_windows() -> Result<Vec<PrinterInfo>, String> {
    // Use PowerShell to get printer list
    let output = Command::new("powershell")
        .args([
            "-Command",
            "Get-Printer | Select-Object Name, DriverName, Default | ConvertTo-Json",
        ])
        .output()
        .map_err(|e| format!("Failed to get printers: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("PowerShell command failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    // Handle case where PowerShell returns nothing or single object (not array)
    if stdout.trim().is_empty() {
        return Ok(Vec::new());
    }

    // Try to parse as array first, then as single object
    #[derive(Deserialize)]
    struct WinPrinter {
        #[serde(rename = "Name")]
        name: String,
        #[serde(rename = "DriverName")]
        driver_name: Option<String>,
        #[serde(rename = "Default")]
        default: Option<bool>,
    }

    let win_printers: Vec<WinPrinter> = serde_json::from_str(&stdout)
        .or_else(|_| {
            // Try parsing as single object
            serde_json::from_str::<WinPrinter>(&stdout).map(|p| vec![p])
        })
        .map_err(|e| format!("Failed to parse printer list: {} - Output: {}", e, stdout))?;

    let printers = win_printers
        .into_iter()
        .map(|p| PrinterInfo {
            name: p.name,
            is_default: p.default.unwrap_or(false),
            description: p.driver_name,
            status: None,
        })
        .collect();

    Ok(printers)
}

#[cfg(target_os = "windows")]
async fn print_html_windows(html: &str, options: &PrintOptions) -> Result<PrintResult, String> {
    use std::os::windows::process::CommandExt;

    // Create a temporary HTML file
    let mut temp_file = NamedTempFile::with_suffix(".html")
        .map_err(|e| format!("Failed to create temp file: {}", e))?;

    // Add print-specific CSS for thermal printers
    let paper_width = options.paper_width.unwrap_or(80);
    let styled_html = format!(
        r#"<!DOCTYPE html>
<html>
<head>
<style>
@page {{
    size: {}mm auto;
    margin: 0;
}}
@media print {{
    body {{
        width: {}mm;
        margin: 0;
        padding: 2mm;
    }}
}}
</style>
</head>
<body>
{}
</body>
</html>"#,
        paper_width, paper_width, html
    );

    temp_file
        .write_all(styled_html.as_bytes())
        .map_err(|e| format!("Failed to write HTML to temp file: {}", e))?;

    let file_path = temp_file.path().to_string_lossy().to_string();

    // On Windows, we use PowerShell to print HTML via default browser's print function
    // or use print verb on the file
    let copies = options.copies.unwrap_or(1);

    let print_script = if let Some(ref printer) = options.printer {
        format!(
            r#"
            $ie = New-Object -ComObject InternetExplorer.Application
            $ie.Visible = $false
            $ie.Navigate("{}")
            while ($ie.Busy) {{ Start-Sleep -Milliseconds 100 }}
            for ($i = 0; $i -lt {}; $i++) {{
                $ie.ExecWB(6, 2)
            }}
            Start-Sleep -Seconds 2
            $ie.Quit()
            "#,
            file_path.replace("\\", "\\\\"),
            copies
        )
    } else {
        // Use default print behavior
        format!(
            r#"
            Start-Process -FilePath "{}" -Verb Print -Wait
            "#,
            file_path.replace("\\", "\\\\")
        )
    };

    // CREATE_NO_WINDOW flag
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let output = Command::new("powershell")
        .args(["-Command", &print_script])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| format!("Failed to execute print command: {}", e))?;

    if output.status.success() {
        Ok(PrintResult {
            success: true,
            error: None,
            job_id: None,
        })
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Ok(PrintResult {
            success: false,
            error: Some(if stderr.is_empty() {
                "Print command failed".to_string()
            } else {
                stderr.to_string()
            }),
            job_id: None,
        })
    }
}
