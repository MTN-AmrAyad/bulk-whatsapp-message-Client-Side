'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function Logs() {
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
	const [skip, setSkip] = useState(0);
	const [limit, setLimit] = useState(10);
	const [totalLogs, setTotalLogs] = useState(0);

	useEffect(() => {
		const fetchLogs = async () => {
			try {
				const response = await fetch(`http://localhost:3000/logs?skip=${skip}&limit=${limit}`, {
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

	return (
		<main
			className='flex min-h-screen flex-col items-center justify-start p-6 bg-gray-100 w-screen h-screen'
			dir='ltr'
		>
			<div className='relative overflow-x-auto shadow-md sm:rounded-lg w-full'>
				<table className='w-full text-sm text-left rtl:text-right text-gray-500'>
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
						{logs?.map((log) => (
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
								<td className='px-6 py-4'>{log.phoneNumber}</td>
								<td className='px-6 py-4 bg-gray-50'> {log.message}</td>
								<td className='px-6 py-4'>
									{log.status === 'sent' ? (
										<span className='text-green-500'>{log.status.toUpperCase()}</span>
									) : (
										<span className='text-red-500'>{log.status.toUpperCase()}</span>
									)}
								</td>
								<td className='px-6 py-4 bg-gray-50'> {new Date(log.sentAt).toLocaleString()}</td>
								<td className='px-6 py-4'>{log.error}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className='flex justify-evenly mt-4 w-full'>
				<button
					onClick={handlePreviousPage}
					disabled={skip === 0}
					className='px-4 py-2 bg-blue-500 text-white rounded'
				>
					Previous
				</button>
				<button
					onClick={handleExportToExcel}
					className='px-4 py-2 bg-green-500 text-white rounded'
				>
					Export to Excel
				</button>
				<button
					onClick={handleNextPage}
					disabled={skip + limit >= totalLogs}
					className='px-4 py-2 bg-blue-500 text-white rounded'
				>
					Next
				</button>
			</div>
		</main>
	);
}
