"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";

export type UserType = "user" | "instructor";

export interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  avatarUrl?: string;
  bio?: string;
  specialties?: string[]; // For instructors
  isOnline?: boolean; // For instructors
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    userType: UserType
  ) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password: string,
    userType: UserType
  ) => Promise<boolean>;
  logout: () => void;
  allInstructors: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock instructors data
const initialInstructors: User[] = [
  {
    id: "inst-1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@livevitals.com",
    userType: "instructor",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Certified nutritionist with 10+ years of experience in weight management and sports nutrition.",
    specialties: ["Nutrition", "Weight Management", "Sports Performance"],
    isOnline: false,
  },
  {
    id: "inst-2",
    name: "Michael Chen, PT",
    email: "michael.chen@livevitals.com",
    userType: "instructor",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    bio: "Physical therapist specializing in rehabilitation and injury prevention for athletes.",
    specialties: ["Physical Therapy", "Injury Prevention", "Athletic Training"],
    isOnline: false,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allInstructors, setAllInstructors] =
    useState<User[]>(initialInstructors);

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("livevitals_user");
    const savedInstructors = localStorage.getItem("livevitals_instructors");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (savedInstructors) {
      setAllInstructors(JSON.parse(savedInstructors));
    }

    setIsLoading(false);
  }, []);

  // Save user and instructors to localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem("livevitals_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("livevitals_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(
      "livevitals_instructors",
      JSON.stringify(allInstructors)
    );
  }, [allInstructors]);

  // Mock login function
  const login = async (
    email: string,
    password: string,
    userType: UserType
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, we'll create a new user if it's not an existing instructor
      const existingInstructor = allInstructors.find(
        (instructor) =>
          instructor.email === email && instructor.userType === "instructor"
      );

      if (existingInstructor) {
        // Update instructor to be online
        const updatedInstructors = allInstructors.map((instructor) =>
          instructor.id === existingInstructor.id
            ? { ...instructor, isOnline: true }
            : instructor
        );
        setAllInstructors(updatedInstructors);
        setUser({ ...existingInstructor, isOnline: true });
      } else {
        // Create a new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: email.split("@")[0], // Use part of email as name for demo
          email,
          userType,
          isOnline: userType === "instructor",
        };

        if (userType === "instructor") {
          // Add new instructor to the list
          const newInstructor = {
            ...newUser,
            bio: "New instructor at LiveVitals",
            specialties: ["General Fitness"],
          };
          setAllInstructors([...allInstructors, newInstructor]);
          setUser(newInstructor);
        } else {
          setUser(newUser);
        }
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock signup function
  const signup = async (
    name: string,
    email: string,
    password: string,
    userType: UserType
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        userType,
        isOnline: userType === "instructor",
      };

      if (userType === "instructor") {
        // Add new instructor to the list
        const newInstructor = {
          ...newUser,
          bio: "New instructor at LiveVitals",
          specialties: ["General Fitness"],
          avatarUrl: "/placeholder.svg?height=200&width=200",
        };
        setAllInstructors([...allInstructors, newInstructor]);
        setUser(newInstructor);
      } else {
        setUser(newUser);
      }

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    if (user?.userType === "instructor") {
      // Update instructor to be offline
      const updatedInstructors = allInstructors.map((instructor) =>
        instructor.id === user.id
          ? { ...instructor, isOnline: false }
          : instructor
      );
      setAllInstructors(updatedInstructors);
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        allInstructors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
