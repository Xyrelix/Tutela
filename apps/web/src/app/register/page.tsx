import { redirect } from 'next/navigation';

// Sign up and sign in share one page; the API creates the account for a new wallet.
export default function RegisterPage() {
  redirect('/login');
}
