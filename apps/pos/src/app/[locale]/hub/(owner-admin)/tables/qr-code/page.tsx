'use client';

import React, { useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { AlertCircle, Printer, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store';
import type { TableResponseDto } from '@/features/tables/types/table.types';
import type { ApiError } from '@/utils/apiFetch';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Separator } from '@repo/ui/components/separator';
import { getAllTables } from '@/features/tables/services/table.service';

const QR_CODE_BASE_PATH = '/table-sessions/join-by-table-id';
const storeTablesQueryKey = (storeId: string | null) => ['tables', storeId];

export default function TableQrCodePage() {
  const t = useTranslations('tables.qrPage');
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const printRef = useRef<HTMLDivElement>(null);

  const customerAppBaseUrl = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL;
  if (!customerAppBaseUrl) {
    console.error(
      'Error: NEXT_PUBLIC_CUSTOMER_APP_URL environment variable is not set.'
    );
  }

  const {
    data: tables = [],
    isLoading,
    isError,
    error,
  } = useQuery<TableResponseDto[], Error | ApiError>({
    queryKey: storeTablesQueryKey(selectedStoreId),
    queryFn: async () => {
      if (!selectedStoreId) return [];
      return getAllTables(selectedStoreId);
    },
    enabled: !!selectedStoreId,
    refetchOnWindowFocus: false,
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `table-qr-codes-${selectedStoreId || 'store'}`,
    onPrintError: (printError) => {
      console.error('Printing error:', printError);
      toast.error(t('printFailed'));
    },
  });

  const downloadQrCode = useCallback(
    (table: TableResponseDto) => {
      if (!customerAppBaseUrl) {
        toast.error(t('cannotGenerateQR'));
        return;
      }
      const canvas = document.getElementById(
        `qr-canvas-${table.id}`
      ) as HTMLCanvasElement;
      if (canvas) {
        try {
          const pngUrl = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');

          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;

          const safeTableName = table.name
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();
          downloadLink.download = `table-qr-${safeTableName}-${table.id.substring(0, 6)}.png`;

          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success(t('downloadingQR', { name: table.name }));
        } catch (e) {
          console.error('Error generating download:', e);
          toast.error(t('downloadFailed'));
        }
      } else {
        console.error(`Canvas not found for table ${table.id}`);
        toast.error(t('elementNotFound'));
      }
    },
    [customerAppBaseUrl, t]
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 md:p-8">
        <header>
          <Skeleton className="mb-2 h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </header>
        <Skeleton className="h-10 w-40" />
        <Separator />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="mb-3 h-5 w-3/4" />
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="mt-3 h-8 w-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive mx-auto max-w-4xl p-6 text-center">
        <AlertCircle className="text-destructive mx-auto mb-2 h-10 w-10" />
        <p className="font-semibold">{t('errorLoadingTables')}</p>
        {error instanceof Error && (
          <p className="mt-1 text-sm">{error.message}</p>
        )}
        <p className="mt-2 text-sm">{t('couldNotLoad')}</p>
      </div>
    );
  }

  if (!customerAppBaseUrl) {
    return (
      <div className="text-destructive mx-auto max-w-4xl p-6 text-center">
        <AlertCircle className="text-destructive mx-auto mb-2 h-10 w-10" />
        <p className="font-semibold">{t('configError')}</p>
        <p className="mt-1 text-sm">{t('configErrorDescription')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 md:p-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area,
          .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .qr-card-print {
            page-break-inside: avoid;
            border: 1px solid #ccc;
            padding: 1rem;
            text-align: center;
          }
          .qr-code-print canvas {
            max-width: 100%;
            height: auto !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <header className="no-print">
        {/* Hide header when printing */}
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="no-print flex justify-end gap-2">
        {/* Hide buttons when printing */}
        <Button
          onClick={() => handlePrint()}
          variant="outline"
          disabled={tables.length === 0}
        >
          <Printer className="mr-2 h-4 w-4" />
          {t('printAll')}
        </Button>
      </div>

      <Separator className="no-print" />

      {tables.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center">
          {t('noTablesFound')}
        </div>
      ) : (
        <div ref={printRef} className="printable-area">
          {/* Grid layout for both screen and print (adjust print columns below) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 print:gap-6">
            {tables.map((table) => {
              const qrValue = `${customerAppBaseUrl}${QR_CODE_BASE_PATH}/${table.id}`;
              return (
                <Card
                  key={table.id}
                  className="qr-card-print flex flex-col items-center p-4"
                >
                  {/* Add print class */}
                  <CardHeader className="mb-2 p-0">
                    <CardTitle className="text-center text-lg">
                      {table.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-grow flex-col items-center justify-center p-0">
                    <QRCodeCanvas
                      id={`qr-canvas-${table.id}`}
                      value={qrValue}
                      size={160}
                      level={'H'}
                      marginSize={8}
                      className="qr-code-print"
                    />
                    {/* Optionally display the URL for debugging/verification */}
                    {/* <p className="text-xs text-muted-foreground mt-2 break-all">{qrValue}</p> */}
                  </CardContent>
                  <CardFooter className="no-print mt-3 w-full p-0">
                    {/* Hide footer on print */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => downloadQrCode(table)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t('downloadQR')}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
