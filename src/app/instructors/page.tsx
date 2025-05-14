"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import PageWrapper from "@/components/PageWrapper";
import { MessageSquare, Video } from "lucide-react";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function InstructorsPage() {
  const { allInstructors, user } = useAuth();
  const [filter, setFilter] = useState<"all" | "online">("all");

  const filteredInstructors =
    filter === "all"
      ? allInstructors
      : allInstructors.filter((instructor) => instructor.isOnline);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="container mx-auto p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Instructors</h1>
              <p className="text-muted-foreground">
                Connect with our expert instructors for personalized guidance
              </p>
            </div>

            {user?.userType === "instructor" && (
              <div className="mt-4 md:mt-0 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-medium">
                  You are logged in as an instructor
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Status: {user.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All Instructors ({allInstructors.length})
            </Button>
            <Button
              variant={filter === "online" ? "default" : "outline"}
              onClick={() => setFilter("online")}
            >
              Online Now ({allInstructors.filter((i) => i.isOnline).length})
            </Button>
          </div>

          {filteredInstructors.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">
                No instructors available
              </h2>
              <p className="text-muted-foreground">
                {filter === "online"
                  ? "There are no instructors online at the moment. Please check back later."
                  : "No instructors have been added yet."}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredInstructors.map((instructor) => (
                <motion.div key={instructor.id} variants={cardVariants}>
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16">
                            <Image
                              src={
                                instructor.avatarUrl ||
                                "/placeholder.svg?height=64&width=64"
                              }
                              alt={instructor.name}
                              fill
                              className="rounded-full object-cover"
                            />
                            {instructor.isOnline && (
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {instructor.name}
                            </CardTitle>
                            <CardDescription>
                              {instructor.isOnline ? (
                                <span className="flex items-center text-green-500 dark:text-green-400">
                                  <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mr-1.5"></span>
                                  Online
                                </span>
                              ) : (
                                <span className="flex items-center text-muted-foreground">
                                  <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 mr-1.5"></span>
                                  Offline
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm mb-4">
                        {instructor.bio || "No bio available"}
                      </p>

                      {instructor.specialties &&
                        instructor.specialties.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">
                              Specialties
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {instructor.specialties.map(
                                (specialty, index) => (
                                  <Badge key={index} variant="secondary">
                                    {specialty}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={!instructor.isOnline}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          className="flex-1"
                          disabled={!instructor.isOnline}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Video Call
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
}
