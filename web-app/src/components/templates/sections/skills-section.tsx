'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Target, Zap, Award } from 'lucide-react';
import type { Portfolio, User } from '@/types';

interface SkillsSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function SkillsSection({ portfolio, user, isEditing = false, className = '' }: SkillsSectionProps) {
  // Core skills with proficiency levels
  const coreSkills = [
    { skill: "Acting", level: 95, category: "Performance" },
    { skill: "Voice Work", level: 88, category: "Performance" },
    { skill: "Dancing", level: 82, category: "Movement" },
    { skill: "Singing", level: 90, category: "Performance" },
    { skill: "Improvisation", level: 85, category: "Performance" },
    { skill: "Script Analysis", level: 92, category: "Preparation" }
  ];

  // Technical skills
  const technicalSkills = [
    "Camera Awareness",
    "Teleprompter Reading",
    "Green Screen Work",
    "Motion Capture",
    "Stage Combat",
    "Aerial Work"
  ];

  // Soft skills
  const softSkills = [
    "Team Collaboration",
    "Direction Taking",
    "Adaptability",
    "Time Management",
    "Professional Networking",
    "Creative Problem Solving"
  ];

  const getSkillColor = (category: string) => {
    switch (category) {
      case "Performance": return "text-blue-600";
      case "Movement": return "text-green-600";
      case "Preparation": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const getProgressColor = (level: number) => {
    if (level >= 90) return "bg-green-500";
    if (level >= 80) return "bg-blue-500";
    if (level >= 70) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <section className={`py-16 lg:py-24 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Skills & Expertise
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive overview of my artistic abilities, technical skills, and professional competencies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Core Skills with Proficiency */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Core Competencies</h3>
              </div>

              <div className="space-y-6">
                {coreSkills.map((item, index) => (
                  <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{item.skill}</h4>
                          <p className={`text-sm ${getSkillColor(item.category)}`}>{item.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">{item.level}%</span>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className={`w-4 h-4 ${
                                  starIndex < Math.floor(item.level / 20)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Progress value={item.level} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Portfolio Specialties */}
              {portfolio.specialties && portfolio.specialties.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-900">Specializations</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {portfolio.specialties.map((specialty, index) => (
                      <Card key={index} className="bg-purple-50 border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="font-medium text-gray-900">{specialty}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Technical & Soft Skills */}
            <div className="space-y-8">
              {/* Technical Skills */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Technical Skills</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {technicalSkills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-800">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-6 h-6 text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-900">Professional Skills</h3>
                </div>
                
                <div className="space-y-3">
                  {softSkills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-800">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Skills */}
              {portfolio.skills && portfolio.skills.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Skills</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Categories Summary */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
                <CardContent className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Skill Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {coreSkills.filter(s => s.category === "Performance").length}
                      </div>
                      <div className="text-sm text-gray-600">Performance Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {technicalSkills.length}
                      </div>
                      <div className="text-sm text-gray-600">Technical Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {portfolio.specialties?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Specialties</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {softSkills.length}
                      </div>
                      <div className="text-sm text-gray-600">Soft Skills</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Placeholder for editing */}
          {isEditing && (
            <div className="mt-12 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Add and customize your skills and expertise</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}