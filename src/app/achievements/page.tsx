
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Shield, Star, Users, Leaf, Microscope, Zap, TrendingUp, Trophy, CheckCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const originalText = {
  title: 'Achievements',
  description: 'Track your progress, earn badges, and become a top farmer!',
  myBadges: 'My Badges',
  inProgress: 'Work in Progress',
  inProgressDescription: 'Keep up the great work!',
  leaderboard: 'Leaderboard',
  leaderboardDescription: 'Top 5 farmers by Sustainability Score',
  rank: 'Rank',
  farmer: 'Farmer',
  score: 'Score',
};

const achievementsData = {
  earnedBadges: [
    {
      name: "Uzhavan Explorer",
      level: "Gold",
      icon: Star,
      color: "text-yellow-500",
      description: "Used Crop Recommendation 25 times."
    },
    {
      name: "Disease Detective",
      level: "Silver",
      icon: Microscope,
      color: "text-slate-400",
      description: "Identified 10 plant diseases (e.g., Red Palm Weevil)."
    },
    {
      name: "Kootu Pannai Helper", // Community Helper
      level: "Silver",
      icon: Users,
      color: "text-slate-400",
      description: "Posted 10 helpful replies in the Pollachi forum."
    },
    {
      name: "Pasumai Farmer", // Eco Farmer
      level: "Bronze",
      icon: Leaf,
      color: "text-amber-700",
      description: "Achieved a sustainability score of 60+."
    },
    {
      name: "Adi Pattam Sower", // Traditional sowing season
      level: "Gold",
      icon: Zap,
      color: "text-yellow-500",
      description: "Planted recommended crops during the Adi Pattam season."
    },
  ],
  inProgress: [
    {
      name: "Pasumai Farmer - Silver",
      progress: 78,
      goal: 80,
      description: "Achieve a sustainability score of 80."
    },
    {
      name: "Disease Detective - Gold",
      progress: 12,
      goal: 25,
      description: "Identify 13 more diseases (Coconut, Banana, etc.)."
    },
    {
      name: "Kootu Pannai Helper - Gold",
      progress: 11,
      goal: 25,
      description: "Post 14 more helpful replies to get the Gold badge."
    },
  ],
  leaderboard: [
    { rank: 1, name: "Karthik Raja", score: 95, avatar: "https://ui-avatars.com/api/?name=Karthik+Raja&background=random" },
    { rank: 2, name: "Lakshmi Narayanan", score: 92, avatar: "https://ui-avatars.com/api/?name=Lakshmi+Narayanan&background=random" },
    { rank: 3, name: "Senthil Kumar", score: 88, avatar: "https://ui-avatars.com/api/?name=Senthil+Kumar&background=random" },
    { rank: 4, name: "Meena Kumari", score: 85, avatar: "https://ui-avatars.com/api/?name=Meena+Kumari&background=random" },
    { rank: 5, name: "Arunachalam", score: 81, avatar: "https://ui-avatars.com/api/?name=Arunachalam&background=random" },
  ]
};

const BadgeIcon = ({ level }: { level: string }) => {
  if (level === 'Gold') return <Star className="fill-current" />;
  if (level === 'Silver') return <Shield className="fill-current" />;
  return <Award className="fill-current" />;
};

export default function AchievementsPage() {
  const { T } = useTranslation(originalText);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold"><T textKey="title" /></h1>
        <p className="text-muted-foreground"><T textKey="description" /></p>
      </div>

      {/* My Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl"><T textKey="myBadges" /></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {achievementsData.earnedBadges.map(badge => (
              <div key={badge.name} className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-muted/50 border">
                <div className={`relative ${badge.color}`}>
                  <badge.icon size={48} strokeWidth={1.5} />
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    <BadgeIcon level={badge.level} />
                  </div>
                </div>
                <p className="font-bold text-sm">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* In Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl"><T textKey="inProgress" /></CardTitle>
            <CardDescription><T textKey="inProgressDescription" /></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {achievementsData.inProgress.map(item => (
              <div key={item.name}>
                <div className="flex justify-between items-end mb-1">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.progress} / {item.goal}</p>
                </div>
                <Progress value={(item.progress / item.goal) * 100} />
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl"><T textKey="leaderboard" /></CardTitle>
            <CardDescription><T textKey="leaderboardDescription" /></CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"><T textKey="rank" /></TableHead>
                  <TableHead><T textKey="farmer" /></TableHead>
                  <TableHead className="text-right"><T textKey="score" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievementsData.leaderboard.map(user => (
                  <TableRow key={user.rank}>
                    <TableCell className="font-bold">{user.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{user.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

