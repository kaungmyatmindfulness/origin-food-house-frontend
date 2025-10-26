'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/lib/toast';

interface ContactUsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const contactFormSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactUsDialog({ open, onOpenChange }: ContactUsDialogProps) {
  const t = useTranslations('landing.contactUs');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      company: '',
      message: '',
    },
  });

  /**
   * Submits form data to HubSpot Forms API
   * @see https://developers.hubspot.com/docs/api/marketing/forms
   */
  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
      const formId = process.env.NEXT_PUBLIC_HUBSPOT_CONTACT_US_FORM_ID;

      if (!portalId || !formId) {
        throw new Error('HubSpot configuration missing');
      }

      const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

      const hubspotData = {
        fields: [
          { name: 'firstname', value: data.firstname },
          { name: 'lastname', value: data.lastname },
          { name: 'email', value: data.email },
          ...(data.phone ? [{ name: 'phone', value: data.phone }] : []),
          ...(data.company ? [{ name: 'company', value: data.company }] : []),
          { name: 'message', value: data.message },
        ],
        context: {
          pageUri: window.location.href,
          pageName: document.title,
        },
      };

      const response = await fetch(hubspotUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hubspotData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to submit form');
      }

      toast.success(t('successTitle'), {
        description: t('successDescription'),
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error(t('errorTitle'), {
        description:
          error instanceof Error ? error.message : t('errorDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('firstName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('firstNamePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lastName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('lastNamePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('phone')} {t('optional')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('phonePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('company')} {t('optional')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('companyPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('message')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('messagePlaceholder')}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('submitting') : t('submit')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
