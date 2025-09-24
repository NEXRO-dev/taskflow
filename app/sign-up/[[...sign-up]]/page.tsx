import { redirect } from 'next/navigation';

export default function SignUpPage() {
  // サインアップを無効化し、サインインページにリダイレクト
  redirect('/sign-in');
}
