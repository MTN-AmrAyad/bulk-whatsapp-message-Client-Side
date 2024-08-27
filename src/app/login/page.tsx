'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [qrCodeImage, setQrCodeImage] = useState('');
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		if (!email || !password) {
			alert('Please fill in all fields');
			return;
		}

		try {
			const response = await fetch('http://localhost:3000/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			if (response.ok) {
				const data = await response.json();
				const {
					token,
					qrCodeImage,
				}: {
					token: string;
					qrCodeImage: string;
				} = data;

				const now = new Date();
				const expiryTime = now.getTime() + 12 * 60 * 60 * 1000; // 12 hours

				localStorage.setItem('token', token);
				localStorage.setItem('tokenExpiry', expiryTime.toString());
				if (qrCodeImage) {
					setQrCodeImage(qrCodeImage);
				} else {
					alert('Login successful');
					router.push('/');
				}
			} else {
				alert('Login failed');
			}
		} catch (error) {
			console.error('Error:', error);
			alert('An error occurred while logging in');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className='flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100'>
			{qrCodeImage && (
				<div
					className='flex flex-col items-center space-y-4 bg-white p-8 rounded-lg shadow-lg w-full max-w-md
				absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10
				'
				>
					<h1 className='text-2xl font-bold text-center'>امسح الكود لتسجيل الدخول</h1>
					<img
						src={qrCodeImage}
						alt='QR Code'
						className='w-64 h-64'
					/>
					<button
						onClick={() => {
							setQrCodeImage('');
							router.push('/');
						}}
						className='py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
					>
						تم مسح الكود؟ اضغط هنا
					</button>
				</div>
			)}
			<form
				onSubmit={handleSubmit}
				className='flex flex-col space-y-6 bg-white p-8 rounded-lg shadow-lg w-full max-w-md'
			>
				<h1 className='text-2xl font-bold text-center'>تسجيل الدخول</h1>
				<div>
					<label
						htmlFor='email'
						className='block text-sm font-medium text-gray-700'
						dir='rtl'
					>
						البريد الإلكتروني
					</label>
					<input
						type='email'
						id='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
						required
					/>
				</div>
				<div>
					<label
						htmlFor='password'
						className='block text-sm font-medium text-gray-700'
						dir='rtl'
					>
						كلمة المرور
					</label>
					<input
						type='password'
						id='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
						required
					/>
				</div>
				<button
					type='submit'
					className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
					disabled={isSubmitting}
				>
					{isSubmitting ? 'جاري تسجيل الدخول...' : 'سجل الدخول'}
				</button>
			</form>
		</main>
	);
}
