
'use client';

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Sprout, Tractor, User, Mail, Settings, Save, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";

const initialFarmerProfile = {
  name: 'Rohan Singh',
  email: 'rohan.s@example.com',
  avatarUrl: 'https://picsum.photos/seed/rohan/200/200',
  joinYear: 2021,
  location: {
    district: 'Ranchi',
    state: 'Jharkhand',
  },
  farmSize: '5 Acres',
  primaryCrops: ['Rice', 'Wheat', 'Maize', 'Vegetables'],
  interests: ['Organic Farming', 'Water Conservation', 'Soil Health', 'Agri-tech'],
  bio: "A passionate third-generation farmer from Jharkhand, focused on integrating sustainable and modern agricultural practices to improve yield and soil health. Always eager to learn and connect with fellow farmers."
};

const originalText = {
  farmer: "Farmer",
  editProfile: "Edit Profile",
  saveChanges: "Save Changes",
  cancel: "Cancel",
  about: "About",
  details: "Details",
  farmingSince: "Farming since",
  farmSize: "farm size",
  primaryCrops: "Primary Crops",
  cropsDescription: "The main crops cultivated on the farm.",
  cropsPlaceholder: "Enter crops separated by commas.",
  interests: "Interests",
  interestsDescription: "Topics and techniques of interest.",
  interestsPlaceholder: "Enter interests separated by commas.",
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialFarmerProfile);
  const [formData, setFormData] = useState(initialFarmerProfile);
  const { translatedText, T, isTranslating } = useTranslation(originalText);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'district' || name === 'state') {
        setFormData(prev => ({ ...prev, location: { ...prev.location, [name]: value } }));
    } else if (name === 'primaryCrops' || name === 'interests') {
        setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
    } 
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-6">
            <Avatar className="size-24 border-4 border-primary/20">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="farmer portrait" />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              {isEditing ? (
                 <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="text-3xl font-bold font-headline p-0 border-0 h-auto" />
                 </div>
              ) : (
                <h1 className="text-3xl font-bold font-headline">{profile.name}</h1>
              )}
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="size-4" /> <T textKey="farmer" />
              </p>
               <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="size-4" /> {profile.email}
              </p>
            </div>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isTranslating}>
                <Save className="mr-2"/> <T textKey="saveChanges" />
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isTranslating}>
                <XCircle className="mr-2"/> <T textKey="cancel" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} disabled={isTranslating}>
                <Settings className="mr-2"/>
                <T textKey="editProfile" />
            </Button>
          )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl"><T textKey="about" /></CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea name="bio" value={formData.bio} onChange={handleInputChange} className="min-h-[150px]" />
              ) : (
                <p className="text-muted-foreground">
                  {profile.bio}
                </p>
              )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl"><T textKey="details" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-primary" />
                 {isEditing ? (
                   <div className="flex gap-2 text-sm">
                     <Input name="district" value={formData.location.district} onChange={handleInputChange} placeholder="District" />
                     <Input name="state" value={formData.location.state} onChange={handleInputChange} placeholder="State" />
                   </div>
                 ) : (
                    <span className="text-muted-foreground">{profile.location.district}, {profile.location.state}</span>
                 )}
              </div>
               <div className="flex items-center gap-3">
                <Calendar className="size-5 text-primary" />
                {isEditing ? (
                    <Input name="joinYear" type="number" value={formData.joinYear} onChange={handleInputChange} placeholder="Year" className="w-24" />
                ) : (
                    <span className="text-muted-foreground"><T textKey="farmingSince" /> {profile.joinYear}</span>
                )}
              </div>
               <div className="flex items-center gap-3">
                <Tractor className="size-5 text-primary" />
                {isEditing ? (
                     <Input name="farmSize" value={formData.farmSize} onChange={handleInputChange} placeholder="e.g., 5 Acres"/>
                ) : (
                    <span className="text-muted-foreground">{profile.farmSize} <T textKey="farmSize" /></span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl"><T textKey="primaryCrops" /></CardTitle>
              <CardDescription><T textKey="cropsDescription" /></CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Textarea name="primaryCrops" value={formData.primaryCrops.join(', ')} onChange={handleInputChange} />
                  <p className="text-xs text-muted-foreground mt-2"><T textKey="cropsPlaceholder" /></p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.primaryCrops.map(crop => (
                    <Badge key={crop} variant="secondary" className="text-base py-1 px-3">
                      <Sprout className="mr-2 size-4" />
                      {crop}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl"><T textKey="interests" /></CardTitle>
              <CardDescription><T textKey="interestsDescription" /></CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                 <div>
                  <Textarea name="interests" value={formData.interests.join(', ')} onChange={handleInputChange} />
                   <p className="text-xs text-muted-foreground mt-2"><T textKey="interestsPlaceholder" /></p>
                 </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                    {profile.interests.map(interest => (
                        <Badge key={interest} variant="outline" className="text-base py-1 px-3">{interest}</Badge>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
