'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Award, Star, TrendingUp } from 'lucide-react';
import type { Portfolio, User } from '@/types';

interface ExperienceSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function ExperienceSection({ portfolio, user, isEditing = false, className = '' }: ExperienceSectionProps) {
  // Mock experience data - in a real app, this would come from the portfolio
  const experiences = [
    {
      title: "Lead Actor",
      company: "Metropolitan Theatre",
      period: "2022 - Present",
      description: "Starring role in multiple productions including Shakespeare's Hamlet and contemporary works.",
      skills: ["Stage Acting", "Character Development", "Voice Projection"]
    },
    {
      title: "Supporting Actor",
      company: "City Drama Company",
      period: "2020 - 2022",
      description: "Featured in various supporting roles, developing range across different genres and styles.",
      skills: ["Method Acting", "Improvisation", "Dialect Coaching"]
    },
    {
      title: "Background Actor",
      company: "Film Productions Inc",
      period: "2019 - 2020",
      description: "Gained experience in film and television productions, learning industry standards.",
      skills: ["Screen Acting", "Continuity", "Direction Following"]
    }
  ];

  // Mock skills with proficiency levels
  const skillLevels = [
    { skill: "Stage Acting", level: 95 },
    { skill: "Screen Acting", level: 85 },
    { skill: "Voice Acting", level: 78 },
    { skill: "Dance", level: 82 },
    { skill: "Singing", level: 88 },
    { skill: "Improvisation", level: 90 }
  ];

  return (
    <section className={`py-16 lg:py-24 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Experience & Skills
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A journey of growth, learning, and artistic development across various roles and productions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Experience Timeline */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Professional Experience</h3>
              </div>

              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{exp.title}</h4>
                          <p className="text-lg text-blue-600 font-medium">{exp.company}</p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {exp.period}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {exp.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Overall Experience */}
              {portfolio.experience && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Total Experience</h4>
                    </div>
                    <p className="text-blue-800 font-medium">{portfolio.experience}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Skills & Specialties */}
            <div className="space-y-8">
              {/* Skill Levels */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Skill Proficiency</h3>
                </div>
                
                <div className="space-y-4">
                  {skillLevels.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">{item.skill}</span>
                        <span className="text-sm text-gray-600">{item.level}%</span>
                      </div>
                      <Progress value={item.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              {portfolio.specialties && portfolio.specialties.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Star className="w-6 h-6 text-yellow-600" />
                    <h3 className="text-xl font-bold text-gray-900">Specialties</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {portfolio.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-gray-800 font-medium">{specialty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills List */}
              {portfolio.skills && portfolio.skills.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Skills</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">5+</div>
                    <div className="text-sm text-gray-600">Years Active</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">20+</div>
                    <div className="text-sm text-gray-600">Productions</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
                    <div className="text-sm text-gray-600">Lead Roles</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">3</div>
                    <div className="text-sm text-gray-600">Awards</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Placeholder for editing */}
          {isEditing && (
            <div className="mt-12 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Add your professional experience and skills</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}