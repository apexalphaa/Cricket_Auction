import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";

import { ADMIN_EMAILS } from "../lib/config";

const AuthContext = createContext();

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
                if (ADMIN_EMAILS.includes(user.email)) {
                    setUserRole('admin');
                } else {
                    // Check DB for other roles (like owner mappings or explicit overrides)
                    try {
                        const userRef = ref(db, `users/${user.uid}/role`);
                        const snapshot = await get(userRef);
                        if (snapshot.exists()) {
                            setUserRole(snapshot.val());
                        } else {
                            // Default to viewer
                            setUserRole('viewer');
                        }
                    } catch (e) {
                        console.error("Error fetching role", e);
                        setUserRole('viewer');
                    }
                }

                setCurrentUser(user);
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

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        login,
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
