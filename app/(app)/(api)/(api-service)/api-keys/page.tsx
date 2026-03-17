"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, Plus, Trash2, Key, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

type ApiKey = {
    id: string;
    name: string;
    keyPrefix: string;
    createdAt: string;
    lastUsedAt: string | null;
};

export default function ApiKeysPage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Key Modal States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // State to hold the newly generated key, shown only once
    const [newGeneratedKey, setNewGeneratedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/v1/apiKey");
            const json = await res.json();
            if (json.success && json.data?.apiKeys) {
                setApiKeys(json.data.apiKeys);
            } else {
                toast.error(json.message || "Failed to fetch API keys");
            }
        } catch (error) {
            toast.error("Something went wrong while fetching API keys");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async () => {
        if (!newKeyName.trim() || newKeyName.length < 3) {
            toast.error("Name must be at least 3 characters long");
            return;
        }

        try {
            setIsCreating(true);
            const res = await fetch("/api/v1/apiKey", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: newKeyName }),
            });

            const json = await res.json();

            if (json.success) {
                toast.success(json.message || "API key created successfully");
                setNewGeneratedKey(json.data.key);
                fetchApiKeys();
            } else {
                toast.error(json.message || "Failed to create API key");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteKey = async (id: string) => {
        try {
            const res = await fetch("/api/v1/apiKey", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKeyId: id }),
            });

            const json = await res.json();

            if (json.success) {
                toast.success("API key deleted successfully");
                setApiKeys((prev) => prev.filter((key) => key.id !== id));
            } else {
                toast.error(json.message || "Failed to delete API key");
            }
        } catch (error) {
            toast.error("Something went wrong while deleting API key");
        }
    };

    const handleCopyKey = () => {
        if (newGeneratedKey) {
            navigator.clipboard.writeText(newGeneratedKey);
            toast.success("API key copied to clipboard");
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setNewKeyName("");
        setNewGeneratedKey(null);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black text-white overflow-x-hidden">
            <Navbar />

            <div className="relative z-10 container mx-auto flex flex-col gap-6 max-w-5xl w-full p-4 md:p-6 lg:py-10 mt-16">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            API Keys
                        </h1>
                        <p className="text-neutral-400 text-sm">
                            Manage your API keys for programmatic access to Manim Flow
                            functionality. You can create up to 5 keys.
                        </p>
                    </div>

                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                            if (!open) {
                                handleCloseDialog();
                            } else {
                                setIsDialogOpen(true);
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button
                                disabled={apiKeys.length >= 5}
                                className="bg-white text-black hover:bg-neutral-200 cursor-pointer"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create new secret key
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md">
                            {newGeneratedKey ? (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>Save your secret key</DialogTitle>
                                        <DialogDescription>
                                            Please save this secret key somewhere safe and
                                            accessible. For security reasons,{" "}
                                            <strong>you won&apos;t be able to view it again</strong>{" "}
                                            through your account. If you lose this secret key,
                                            you&apos;ll need to generate a new one.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex items-center space-x-2 mt-4">
                                        <div className="grid flex-1 gap-2">
                                            <Input
                                                id="secret-key"
                                                unselectable="on"
                                                readOnly
                                                value={newGeneratedKey}
                                                className="bg-neutral-900 border-neutral-700 font-mono text-sm text-neutral-300"
                                            />
                                        </div>
                                        <Button
                                            size="icon"
                                            onClick={handleCopyKey}
                                            variant="secondary"
                                        >
                                            <span className="sr-only">Copy</span>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <DialogFooter className="mt-6 sm:justify-start">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleCloseDialog}
                                        >
                                            Done
                                        </Button>
                                    </DialogFooter>
                                </>
                            ) : (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>Create new secret key</DialogTitle>
                                        <DialogDescription>
                                            Give your key a descriptive name so you remember what
                                            it&apos;s for.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex items-center space-x-2 my-4">
                                        <div className="grid flex-1 gap-2">
                                            <Input
                                                id="name"
                                                placeholder="e.g. Production Server, Zapier Integration"
                                                value={newKeyName}
                                                onChange={(e) => setNewKeyName(e.target.value)}
                                                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCloseDialog}
                                            className="border-neutral-700 text-neutral-300 hover:text-black text-black cursor-pointer"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleCreateKey}
                                            disabled={isCreating || !newKeyName.trim()}
                                            className="bg-white text-black hover:bg-neutral-200 cursor-pointer"
                                        >
                                            {isCreating ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : null}
                                            Create secret key
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-[#111111]/80 backdrop-blur-sm overflow-hidden mt-4 shadow-xl">
                    {loading ? (
                        <div className="flex items-center justify-center p-12 flex-col gap-4 text-neutral-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p>Loading API keys...</p>
                        </div>
                    ) : apiKeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-4 border border-neutral-800">
                                <Key className="w-6 h-6 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No API keys yet</h3>
                            <p className="text-neutral-400 max-w-sm mx-auto mb-6">
                                Create an API key to securely track and usage limits across your
                                apps.
                            </p>
                            <Button
                                onClick={() => setIsDialogOpen(true)}
                                className="bg-white text-black hover:bg-neutral-200 cursor-pointer"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create new secret key
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-neutral-400 bg-neutral-900/50 uppercase border-b border-neutral-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-medium">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-4 font-medium">
                                            Secret Key
                                        </th>
                                        <th scope="col" className="px-6 py-4 font-medium">
                                            Created
                                        </th>
                                        <th scope="col" className="px-6 py-4 font-medium">
                                            Last Used
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-right font-medium"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {apiKeys.map((key) => (
                                        <tr
                                            key={key.id}
                                            className="hover:bg-neutral-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                                {key.name}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-neutral-400">
                                                <span className="bg-neutral-900 border border-neutral-800 px-2 py-1 rounded inline-block text-neutral-300">
                                                    {key.keyPrefix}••••••••••••••••••••••••
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400">
                                                {new Date(key.createdAt).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400">
                                                {key.lastUsedAt
                                                    ? new Date(key.lastUsedAt).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "Never"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-neutral-400 hover:text-red-400 hover:bg-red-400/10 cursor-pointer"
                                                            title="Delete Key"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-[#0a0a0a] border border-neutral-800 text-white shadow-xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white">
                                                                Are you sure?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription className="text-neutral-400">
                                                                This action cannot be undone. This
                                                                will permanently delete your API key{" "}
                                                                <strong className="text-neutral-200">
                                                                    "{key.name}"
                                                                </strong>
                                                                . Any applications using this key
                                                                will immediately lose access.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white cursor-pointer">
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDeleteKey(key.id)
                                                                }
                                                                className="bg-red-600 text-white hover:bg-red-700 cursor-pointer border border-red-600"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <p className="text-xs text-zinc-500 mt-3 text-center">
                Credits are shared across the website and API. Top up anytime at{" "}
                <a href="/pricing" className="text-zinc-400 underline underline-offset-2">
                    manimflow.com/pricing
                </a>
                .
            </p>
        </div>
    );
}
