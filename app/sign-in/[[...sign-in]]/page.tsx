import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FlowCraft Pro</h1>
          <p className="text-gray-600">アカウントにサインインしてください</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white',
              card: 'shadow-xl border-0',
              headerTitle: 'text-gray-900',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50',
              formFieldInput: 'border-gray-200 focus:border-primary focus:ring-primary',
              footerActionLink: 'text-primary hover:text-primary/80',
              captcha: 'display: none !important',
              captchaContainer: 'display: none !important',
              captchaWidget: 'display: none !important',
              captchaWidgetContainer: 'display: none !important'
            },
          }}
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
          redirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
          unsafeMetadata={{
            skipCaptcha: true
          }}
        />
      </div>
    </div>
  );
}
