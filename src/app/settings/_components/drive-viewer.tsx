"use client";

import { useSession, useUser } from "@clerk/nextjs";
import { useCallback, useMemo, useState } from "react";
import { getGoogleToken } from "../actions";
import { reauthAcct } from "@/lib/reauthAcct";

// A simple component for an individual file item
const FileItem = ({ name }: {name: any}) => (
	<div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
			{/* Google Drive File Icon */}
			<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 text-blue-500 mr-4 flex-shrink-0"
					viewBox="0 0 24 24"
					fill="currentColor"
			>
					<path d="M20.94,8.34l-6.28-6.28A2,2,0,0,0,13.25,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V9.75A2,2,0,0,0,20.94,8.34ZM14,4.41,17.59,8H14Z" />
			</svg>
			<span className="text-gray-800 font-medium truncate">{name}</span>
	</div>
);

export function DriveViewer() {
	const { user } = useUser();
	const { session } = useSession();
	const [files, setFiles] = useState([]);
	const [isLoading, setIsloading] = useState(false);
	const [error, setError] = useState<string | null>("");

	const isGoogleConnected = useMemo(
			() => user?.externalAccounts.some((acc) => acc.provider === "google"),
			[user?.externalAccounts]
	);

	const connectGoogleAccount = useCallback(async () => {
			if (!user) return;

			try {
					await user.createExternalAccount({
							strategy: "oauth_google",
							redirectUrl: window.location.href,
					});
			} catch (error) {
					console.error("Error connecting Google Account", error);
			}
	}, [user]);

	const fetchFiles = useCallback(async () => {
			if (!isGoogleConnected || !session) {
					setError("Failed to connect Google Account. Please try again");
					return;
			}
			setIsloading(true);
			setError(null);
			setFiles([]);

			try {
					const googleAccount = user?.externalAccounts.find(
							(ea) => ea.provider === "google"
					);
					if (
							!googleAccount?.approvedScopes?.includes(
									"https://www.googleapis.com/auth/drive"
							)
					) {
							void reauthAcct(user);
							return;
					}

					// const googleToken = await session.getToken({template: "google"})
					const { token: googleToken } = await getGoogleToken();
					if (!googleToken) {
							throw new Error("Could not retrieve Google access token");
					}
					const driveAPIURL =
							"https://www.googleapis.com/drive/v3/files?pageSize=15&orderBy=modifiedTime desc";

					const response = await fetch(driveAPIURL, {
							headers: {
									Authorization: `Bearer ${googleToken}`,
							},
					});

					if (!response.ok) {
							const errorData = await response.json();
							throw new Error(
									errorData.error.message ||
											"Something went wrong while fetching files."
							);
					}

					const data = await response.json();
					setFiles(data.files);
			} catch (error: any) {
					console.error("Frontend | Error fetching files directly:", error);
					setError(error.message);
			} finally {
					setIsloading(false);
			}
	}, [isGoogleConnected, session]);

	console.log(typeof user?.externalAccounts.find(ea => ea.provider === "google")?.approvedScopes)

	return (
			<>
					{isGoogleConnected ? (
							<button
									onClick={fetchFiles}
									disabled={isLoading}
									className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
							>
									{isLoading ? "Fetching Files..." : "Fetch My Drive Files"}
							</button>
					) : (
							<button
									onClick={connectGoogleAccount}
									className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
							>
									Connect Google Drive
							</button>
					)}
					{!isLoading && files.length > 0 && (
							<div>
									<h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
											Your Recent Files:
									</h2>
									<div className="space-y-3">
											{files.map((file: any) => (
													<FileItem key={file.id} name={file.name} />
											))}
									</div>
							</div>
					)}

					{!isLoading &&
							files.length === 0 &&
							isGoogleConnected &&
							!error && (
									<div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
											<p className="text-gray-500">
													Click the button above to see your Google Drive
													files.
											</p>
									</div>
							)}
			</>
	);
}
