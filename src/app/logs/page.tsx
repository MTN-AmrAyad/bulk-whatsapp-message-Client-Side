'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function Logs() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [skip, setSkip] = useState<number>(parseInt(searchParams.get('skip') || '0'));
	const [limit, setLimit] = useState<number>(parseInt(searchParams.get('limit') || '50'));

	const [totalLogs, setTotalLogs] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

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

	useEffect(() => {
		const params = new URLSearchParams();
		params.set('skip', skip.toString());
		params.set('limit', limit.toString());
		router.replace(`?${params.toString()}`);
	}, [skip, limit, router]);

	const [logs, setLogs] = useState<
		{
			id: number;
			phoneNumber: string;
			message: string;
			sentAt: string;
			status: string;
			error: string;
		}[]
	>([]);

	useEffect(() => {
		const fetchLogs = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs?skip=${skip}&limit=${limit}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});
				if (response.ok) {
					const { logs, total } = await response.json();
					setLogs(logs);
					setTotalLogs(total);
				} else {
					alert('Failed to fetch logs');
				}
			} catch (error) {
				console.error('Error:', error);
				alert('An error occurred while fetching logs');
			} finally {
				setIsLoading(false);
			}
		};
		fetchLogs();
	}, [skip, limit]);

	const handlePreviousPage = () => {
		if (skip >= limit) {
			setSkip(skip - limit);
		}
	};

	const handleNextPage = () => {
		if (skip + limit < totalLogs) {
			setSkip(skip + limit);
		}
	};

	const handleExportToExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(logs);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
		XLSX.writeFile(workbook, 'logs.xlsx');
	};

	const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setLimit(parseInt(e.target.value));
	};

	return (
		<main
			className='flex min-h-screen flex-col items-center justify-start p-6 bg-gray-100 w-screen h-screen'
			dir='rtl'
		>
			<div className='relative overflow-x-auto shadow-md sm:rounded-lg w-full'>
				<div className='flex justify-between items-center mb-4 px-2'>
					<div>
						<label
							htmlFor='limit'
							className='mr-2'
						>
							Items per page:
						</label>
						<select
							id='limit'
							value={limit}
							onChange={handleLimitChange}
							className='px-3 py-2 border rounded'
						>
							<option value={100}>100</option>
							<option value={200}>200</option>
							<option value={500}>500</option>
							<option value={1000}>1000</option>
							<option value={2000}>2000</option>
						</select>
					</div>
					<p>
						Showing {skip + 1} - {skip + limit} of {totalLogs} logs
						<span className='ml-4 text-sm text-gray-500'>
							Failed logs: {logs.filter((log) => log.status === 'failed').length}
						</span>
					</p>
					<button
						onClick={handleExportToExcel}
						className='px-4 py-2 bg-green-500 text-white rounded'
					>
						Export to Excel
					</button>
				</div>
				{isLoading && (
					<div className='absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80'>
						<div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900' />
					</div>
				)}
				<table
					dir='ltr'
					className='w-full text-sm text-left rtl:text-right text-gray-500'
				>
					<thead className='text-xs text-gray-700 uppercase'>
						<tr>
							<th
								scope='col'
								className='px-6 py-3 bg-gray-50'
							>
								id
							</th>
							<th
								scope='col'
								className='px-6 py-3'
							>
								Phone Number
							</th>
							<th
								scope='col'
								className='px-6 py-3 bg-gray-50'
							>
								Message
							</th>
							<th
								scope='col'
								className='px-6 py-3'
							>
								Status
							</th>
							<th
								scope='col'
								className='px-6 py-3 bg-gray-50'
							>
								Sent At
							</th>
							<th
								scope='col'
								className='px-6 py-3'
							>
								Error
							</th>
						</tr>
					</thead>
					<tbody>
						{!isLoading
							? logs?.map((log) => (
									<tr
										key={log.id}
										className='border-b border-gray-200'
									>
										<th
											scope='row'
											className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50'
										>
											{log.id}
										</th>
										<td className='px-6 py-4'>+{log.phoneNumber.replace('@c.us', '')}</td>
										<td className='px-6 py-4 bg-gray-50'> {log.message}</td>
										<td className='px-6 py-4'>
											{log.status === 'sent' ? (
												<span className='text-green-500'>{log.status.toUpperCase()}</span>
											) : (
												<span className='text-red-500'>{log.status.toUpperCase()}</span>
											)}
										</td>
										<td className='px-6 py-4 bg-gray-50'> {new Date(log.sentAt).toLocaleString()}</td>
										<td className='px-6 py-4 text-red-500'>{log.error}</td>
									</tr>
							  ))
							: null}
					</tbody>
				</table>
			</div>

			<div className='flex justify-between mt-4 w-full'>
				<button
					onClick={handleNextPage}
					disabled={skip + limit >= totalLogs}
					className='px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50'
				>
					Next
				</button>
				<button
					onClick={handlePreviousPage}
					disabled={skip === 0}
					className='px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50'
				>
					Previous
				</button>
			</div>
		</main>
	);
}
