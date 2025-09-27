import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { isClerkConfigured } from '@/lib/utils';
// import CaptchaErrorHandler from '@/components/CaptchaErrorHandler';

// CAPTCHA対策は現在CSSのみで実装

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlowCraft Pro - AI-Powered Task Management Platform',
  description: 'The world\'s most intelligent task manager. Powered by AI, gamified for motivation, and designed for teams that want to achieve more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const useClerk = isClerkConfigured();
  return (
    useClerk ? (
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: '#3b82f6',
            colorText: '#1f2937'
          },
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            card: 'shadow-lg',
            headerTitle: 'text-gray-900',
            headerSubtitle: 'text-gray-600',
            captcha: 'display: none !important',
            captchaContainer: 'display: none !important',
            captchaWidget: 'display: none !important',
            captchaWidgetContainer: 'display: none !important'
          }
        }}
        localization={{
          signIn: {
            start: {
              title: 'アカウントにサインイン',
              subtitle: 'FlowCraft Proにようこそ',
              actionText: 'アカウントをお持ちでない方は',
              actionLink: 'こちらからサインアップしてください'
            },
            emailCode: {
              title: 'メールアドレスを確認',
              subtitle: 'メールに送信された確認コードを入力してください',
              formTitle: '確認コード'
            },
            password: {
              title: 'パスワードを入力',
              subtitle: 'アカウントにサインインするためのパスワードを入力してください'
            }
          },
          signUp: {
            start: {
              title: '新しいアカウントを作成',
              subtitle: 'FlowCraft Proを始めましょう',
              actionText: 'すでにアカウントをお持ちの方',
              actionLink: 'サインインしてください'
            },
            emailCode: {
              title: 'メールアドレスを確認',
              subtitle: 'メールに送信された確認コードを入力してください',
              formTitle: '確認コード'
            }
          },
          userProfile: {
            navbar: {
              title: 'プロフィール',
              description: 'アカウント情報を管理'
            }
          }
        }}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      >
        <html lang="ja">
          <body className={inter.className}>
            {children}
          </body>
        </html>
      </ClerkProvider>
    ) : (
      <html lang="ja">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    )
  );
}