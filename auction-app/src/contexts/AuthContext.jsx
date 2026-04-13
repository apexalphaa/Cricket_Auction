import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ref, get } from "firebase/database";

import { ADMIN_EMAILS, OWNER_EMAILS } from "../lib/config";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'admin' | 'owner' | 'viewer'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check hardcoded admin list first
                // Check hardcoded admin list first
                // Check hardcoded admin list first
                // Check hardcoded admin list first
                if (ADMIN_EMAILS.includes(user.email)) {
                    console.log("Role: admin (hardcoded)");
                    setUserRole('admin');
                    setCurrentUser(user);
                } else if (user.email === "ankit.sharma.cd.civ21@itbhu.ac.in") {
                    console.log("Role: owner (hardcoded BYPASS)");
                    setUserRole('owner');
                    setCurrentUser(user);
                } else {
                    // 1. Check DB Allowlist (Email-based)
                    // Sanitize email: replace '.' with ','
                    const sanitizedEmail = user.email.replace(/\./g, ',');
                    const ownerRef = ref(db, `owners/${sanitizedEmail}`);

                    try {
                        const ownerSnap = await get(ownerRef);
                        if (ownerSnap.exists()) {
                            console.log("Role: owner (found in DB Allowlist)");
                            setUserRole('owner');
                            const ownerData = ownerSnap.val();
                            if (ownerData.teamId) {
                                // Set user WITH teamId
                                setCurrentUser({ ...user, teamId: ownerData.teamId });
                            } else {
                                setCurrentUser(user);
                            }
                        } else {
                            // 2. Check strict User Role (UID-based)
                            const userRef = ref(db, `users/${user.uid}/role`);
                            const userSnap = await get(userRef);
                            if (userSnap.exists()) {
                                setUserRole(userSnap.val());
                                setCurrentUser(user);
                            } else {
                                // Default to viewer
                                console.log("Role: viewer (default)");
                                setUserRole('viewer');
                                setCurrentUser(user);
                            }
                        }
                    } catch (e) {
                        console.error("Error fetching role from DB:", e);
                        setUserRole('viewer');
                        setCurrentUser(user);
                    }
                }
            } else {
                setCurrentUser(null);
                setUserRole('viewer'); // Default to viewer if not logged in
            }
            setLoading(false);
        });


        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        login,
        loginWithGoogle,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: userRole === 'admin',
        isOwner: userRole === 'owner'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
