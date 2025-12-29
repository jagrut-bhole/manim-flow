"use client";

import { TextShimmer } from "@/components/ui/text-shimmer";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {

    const [loading, setLoading] = useState<boolean>(true);
    const [profile, setProfile] = useState(null);

    const fetchProfile = async () => {
        setLoading(true);

        try {
            const response = await axios.get('/api/auth/profile');

            if (response.data.success) {
                setProfile(response.data.data);
                toast.success("Profile loaded successfully!");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProfile();
    }, []);
    return (
        <div>
            <h1>Profile Page</h1>
            {
                loading ?
                    <TextShimmer
                        duration={2}
                        className="text-base font-mono "
                    >Loading profile...
                    </TextShimmer>
                    :
                    <div>
                        <pre>{JSON.stringify(profile, null, 2)}</pre>
                    </div>
            }
        </div>
    )
}