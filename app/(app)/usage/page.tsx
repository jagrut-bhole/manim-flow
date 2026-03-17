"use client";

import { useSession } from "next-auth/react";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { AlertTriangle, ChevronRight, ChevronLeft, Search, Calendar, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { UsageResponse } from "@/app/api/user/usage/usageSchema";
import Navbar from "@/components/Navbar";

export default function Usage() {
    const { data: session, status } = useSession();
    const loading = status === "loading";

    const [usageData, setUsageData] = useState<UsageResponse["data"] | null>(null);
    const [fetching, setFetching] = useState(true);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [searchInput, setSearchInput] = useState("");

    const fetchUsage = async () => {
        setFetching(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search: search,
                source: sourceFilter,
                from: fromDate,
                to: toDate,
            });

            const res = await fetch(`/api/user/usage?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setUsageData(data.data);
            } else {
                setUsageData(null);
            }
        } catch (error) {
            console.error("Failed to fetch usage:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchUsage();
        }
    }, [status, page, search, sourceFilter, fromDate, toDate]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateString));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center">
                <TextShimmer duration={2} className="text-xl font-mono">
                    Loading your usage...
                </TextShimmer>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-500" />
                    <p className="text-red-500">Please login to view your usage</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030303] text-zinc-300 p-6 pt-24 pb-20">
            <div className="max-w-6xl mx-auto space-y-8">
                <Navbar />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Usage Dashboard
                        </h1>
                        <p className="text-zinc-500 mt-2">
                            Monitor your credits and API/Website usage history
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-zinc-400 font-medium text-sm">Credits Available</h3>
                        <p className="text-4xl font-bold text-white mt-2">
                            {usageData?.credits ?? "--"}
                        </p>
                    </div>
                    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-zinc-400 font-medium text-sm">
                            Total Animations Generated
                        </h3>
                        <p className="text-4xl font-bold text-white mt-2">
                            {usageData?.pagination?.total ?? "--"}
                        </p>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-4 md:p-6 space-y-6 shadow-2xl">
                    <div className="flex flex-col xl:flex-row gap-4 xl:items-end justify-between">
                        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by prompt..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full bg-[#030303] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-200 transition-all placeholder:text-zinc-600"
                            />
                        </form>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                            <div className="flex items-center space-x-2 bg-[#030303] border border-zinc-800 rounded-lg p-1 w-full sm:w-auto">
                                <Filter className="w-4 h-4 text-zinc-500 ml-2" />
                                <select
                                    value={sourceFilter}
                                    onChange={(e) => {
                                        setSourceFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="bg-transparent border-none text-sm text-zinc-300 py-1.5 focus:outline-none cursor-pointer w-full pr-4"
                                >
                                    <option value="" className="bg-[#0A0A0A]">
                                        All Sources
                                    </option>
                                    <option value="WEBSITE" className="bg-[#0A0A0A]">
                                        Website
                                    </option>
                                    <option value="API" className="bg-[#0A0A0A]">
                                        API
                                    </option>
                                    <option value="PLAYGROUND" className="bg-[#0A0A0A]">
                                        Playground
                                    </option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none flex items-center bg-[#030303] border border-zinc-800 rounded-lg p-1.5">
                                    <Calendar className="w-4 h-4 text-zinc-500 ml-2 absolute" />
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => {
                                            setFromDate(e.target.value);
                                            setPage(1);
                                        }}
                                        className="bg-transparent border-none w-[135px] text-sm text-zinc-400 focus:outline-none cursor-pointer pl-8 py-1.5"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>
                                <span className="text-zinc-600 font-medium">-</span>
                                <div className="relative flex-1 sm:flex-none flex items-center bg-[#030303] border border-zinc-800 rounded-lg p-1.5">
                                    <Calendar className="w-4 h-4 text-zinc-500 ml-2 absolute" />
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => {
                                            setToDate(e.target.value);
                                            setPage(1);
                                        }}
                                        className="bg-transparent border-none w-[135px] text-sm text-zinc-400 focus:outline-none cursor-pointer pl-8 py-1.5"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-zinc-800">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800/80 bg-[#030303] text-xs uppercase tracking-wider text-zinc-500 font-medium">
                                    <th className="px-6 py-4">Source & ID</th>
                                    <th className="px-6 py-4 max-w-[250px]">Prompt</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Credits</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/60 text-sm">
                                {fetching ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-5">
                                                <div className="h-4 bg-zinc-800 rounded w-28"></div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="h-4 bg-zinc-800 rounded w-full max-w-xs"></div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="h-5 bg-zinc-800 rounded-full w-20"></div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="h-4 bg-zinc-800 rounded w-12"></div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="h-4 md:ml-auto md:mr-0 bg-zinc-800 rounded w-24"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : usageData?.animations?.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-zinc-500"
                                        >
                                            No usage history found for these filters.
                                        </td>
                                    </tr>
                                ) : (
                                    usageData?.animations?.map((anim) => (
                                        <tr
                                            key={anim.id}
                                            className="hover:bg-zinc-800/20 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span
                                                        className={`text-[11px] w-max px-2 py-0.5 rounded shadow-sm font-semibold tracking-wide ${
                                                            anim.source === "API"
                                                                ? "bg-purple-900/30 text-purple-400 border border-purple-500/20"
                                                                : anim.source === "WEBSITE"
                                                                  ? "bg-blue-900/30 text-blue-400 border border-blue-500/20"
                                                                  : "bg-emerald-900/30 text-emerald-400 border border-emerald-500/20"
                                                        }`}
                                                    >
                                                        {anim.source}
                                                    </span>
                                                    <span
                                                        className="text-xs text-zinc-600 font-mono"
                                                        title={anim.id}
                                                    >
                                                        {anim.id.substring(0, 8)}...
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p
                                                    className="text-sm text-zinc-300 line-clamp-2"
                                                    title={anim.prompt}
                                                >
                                                    {anim.prompt}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium border ${
                                                        anim.status === "COMPLETED"
                                                            ? "hover:bg-emerald-500/10 bg-transparent text-emerald-400 border-emerald-500/20"
                                                            : anim.status === "FAILED"
                                                              ? "hover:bg-red-500/10 bg-transparent text-red-500 border-red-500/20"
                                                              : "hover:bg-amber-500/10 bg-transparent text-amber-500 border-amber-500/20"
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                            anim.status === "COMPLETED"
                                                                ? "bg-emerald-500"
                                                                : anim.status === "FAILED"
                                                                  ? "bg-red-500"
                                                                  : "bg-amber-500 animate-pulse"
                                                        }`}
                                                    />
                                                    {anim.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-zinc-400">
                                                {anim.creditsSpent ? (
                                                    <span className="bg-zinc-800/60 px-2 py-1 rounded text-zinc-300 border border-zinc-700/50">
                                                        {anim.creditsSpent} cr
                                                    </span>
                                                ) : (
                                                    "--"
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-zinc-400 text-right whitespace-nowrap">
                                                {formatDate(anim.createdAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {usageData?.pagination && usageData.pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-zinc-800 pt-6 px-2">
                            <span className="text-sm text-zinc-500">
                                Showing page{" "}
                                <span className="text-zinc-300 font-medium">
                                    {usageData.pagination.page}
                                </span>{" "}
                                of{" "}
                                <span className="text-zinc-300 font-medium">
                                    {usageData.pagination.totalPages}
                                </span>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-medium w-8 text-center">{page}</span>
                                <button
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(usageData.pagination!.totalPages, p + 1)
                                        )
                                    }
                                    disabled={page === usageData.pagination.totalPages}
                                    className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
