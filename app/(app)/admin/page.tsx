import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Users, Zap, Clock, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const session = await auth();
    if (!session?.user?.isAdmin) {
        redirect("/dashboard");
    }

    const totalUsers = await prisma.user.count();
    const totalAnimations = await prisma.animation.count();

    const generatingAnimations = await prisma.animation.count({
        where: {
            status: {
                in: ["GENERATING", "RENDERING"],
            },
        },
    });

    const failedAnimations = await prisma.animation.count({
        where: { status: "FAILED" },
    });

    // Fetch recent users
    const recentUsers = await prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
    });

    // Fetch recent animations
    const recentAnimations = await prisma.animation.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-[#030303] text-zinc-100 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Overview of the platform's activity and metrics.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        title="Total Users"
                        value={totalUsers}
                        icon={<Users className="w-5 h-5 text-blue-400" />}
                    />
                    <StatCard
                        title="Total Animations"
                        value={totalAnimations}
                        icon={<Zap className="w-5 h-5 text-yellow-400" />}
                    />
                    <StatCard
                        title="In Progress"
                        value={generatingAnimations}
                        icon={<Clock className="w-5 h-5 text-cyan-400" />}
                    />
                    <StatCard
                        title="Failed Renderings"
                        value={failedAnimations}
                        icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                    />
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Users */}
                    <div className="bg-[#101010] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-zinc-800">
                            <h2 className="text-xl font-semibold text-white">Recent Users</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-left text-zinc-500">
                                        <th className="px-6 py-4 font-medium">Name</th>
                                        <th className="px-6 py-4 font-medium">Email</th>
                                        <th className="px-6 py-4 font-medium whitespace-nowrap">
                                            Joined Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-6 py-4 text-center text-zinc-500"
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-zinc-300">
                                                    {user.name || "N/A"}
                                                </td>
                                                <td
                                                    className="px-6 py-4 text-zinc-400 truncate max-w-[150px]"
                                                    title={user.email}
                                                >
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Animations */}
                    <div className="bg-[#101010] border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-zinc-800">
                            <h2 className="text-xl font-semibold text-white">Recent Animations</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-left text-zinc-500">
                                        <th className="px-6 py-4 font-medium">Prompt</th>
                                        <th className="px-6 py-4 font-medium">User</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAnimations.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-6 py-4 text-center text-zinc-500"
                                            >
                                                No animations found.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentAnimations.map((anim) => (
                                            <tr
                                                key={anim.id}
                                                className="border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors"
                                            >
                                                <td
                                                    className="px-6 py-4 text-zinc-300 truncate max-w-[150px]"
                                                    title={anim.prompt}
                                                >
                                                    {anim.prompt}
                                                </td>
                                                <td
                                                    className="px-6 py-4 text-zinc-400 truncate max-w-[120px]"
                                                    title={anim.user?.email || "Unknown"}
                                                >
                                                    {anim.user?.email || "Unknown"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 flex w-max items-center justify-center rounded-full text-[10px] font-semibold tracking-wide border ${
                                                            anim.status === "COMPLETED"
                                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                                : anim.status === "FAILED"
                                                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                        }`}
                                                    >
                                                        {anim.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
}) {
    return (
        <div className="bg-[#101010] border border-zinc-800 rounded-2xl p-6 flex items-center gap-4 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-zinc-500 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-white tracking-tight mt-1">{value}</p>
            </div>
        </div>
    );
}
