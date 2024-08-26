'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Home() {
	const [file, setFile] = useState<File | null>(null);
	const [message, setMessage] = useState('');
	const [dateTime, setDateTime] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	useEffect(() => {
		const token = localStorage.getItem('token');
		const expiryTime = localStorage.getItem('tokenExpiry');
		if (!token || !expiryTime) {
			alert('Please login first');
			router.push('/login');
			return;
		}
		const now = new Date();
		if (parseInt(expiryTime) < now.getTime()) {
			alert('Session expired, please login again');
			localStorage.removeItem('token');
			localStorage.removeItem('tokenExpiry');
			router.push('/login');
		}
	}, [router]);

	const getMinDateTime = () => {
		const now = new Date();
		now.setMinutes(now.getMinutes() + 1); // Add 1 minute
		now.setSeconds(0, 0); // Set seconds and milliseconds to 0
		return now.toISOString().slice(0, 16); // Format without seconds
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		if (!file || !message || !dateTime) {
			alert('Please fill in all fields');
			return;
		}
		// if the date is in the past or is right now then alert the user
		const now = new Date();
		const selectedDate = new Date(dateTime);
		if (selectedDate.getTime() <= now.getTime() || selectedDate.getTime() - now.getTime() < 60000) {
			alert('Please select a date and time at least 1 minute in the future');
			return;
		}
		const formData = new FormData();
		formData.append('file', file);
		formData.append('message', message);
		formData.append('date', dateTime);

		try {
			const response = await fetch('http://localhost:3000/send-messages', {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				alert('Message sent successfully');
				setDateTime('');
				setMessage('');
				setFile(null);
			} else {
				if (response.status === 400) {
					alert('Please fill in all fields');
					return;
				} else if (response.status === 401) {
					alert('Please login first');
				} else if (response.body) {
					const data = await response.json();
					if (data.error === 'WPPConnect client not initialized') {
						alert('Please login and connect to WhatsApp first');
					}
				} else alert('Failed to send message');
			}
		} catch (error) {
			console.error('Error:', error);
			alert('An error occurred while sending the message');
			router.push('/login');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main
			className='flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100'
			dir='rtl'
		>
			<form
				onSubmit={handleSubmit}
				className='flex flex-col space-y-6 bg-white p-8 rounded-lg shadow-lg w-full max-w-md'
			>
				<h1 className='text-2xl font-bold text-center text-gray-800'>إرسال رسالة</h1>
				<input
					type='file'
					accept='.xlsx, .xls'
					onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
					className='border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
					required
				/>
				<textarea
					placeholder='أدخل رسالتك'
					rows={4}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className='border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
					required
				/>
				<input
					type='datetime-local'
					value={dateTime}
					min={getMinDateTime()}
					onChange={(e) => setDateTime(e.target.value)}
					className='border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
					required
				/>
				<button
					type='submit'
					className='bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300'
					disabled={isSubmitting}
				>
					إرسال
				</button>
			</form>
		</main>
	);
}
