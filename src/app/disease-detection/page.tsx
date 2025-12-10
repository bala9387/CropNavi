
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  aiDiseaseDetection,
} from '@/ai/flows/ai-disease-detection';
import {
    AIDiseaseDetectionOutput,
} from '@/ai/flows/ai-disease-detection.schemas';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ScanLine, AlertTriangle, CheckCircle, Upload, Camera, File } from 'lucide-react';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/use-translation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  plantImage: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Image is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
});

const originalText = {
  title: "AI Disease Detection",
  description: "Use your camera or upload a photo of an affected plant leaf to get an AI-powered diagnosis.",
  liveCamera: "Live Camera",
  uploadFile: "Upload File",
  cameraAccessRequired: "Camera Access Required",
  cameraAccessMessage: "Please allow camera access in your browser settings to use this feature.",
  captureAndDiagnose: "Capture & Diagnose",
  plantPhoto: "Plant Photo",
  uploadDescription: "Upload a clear image of the affected plant part. Max 5MB.",
  diagnose: "Diagnose",
  imageToAnalyze: "Image to Analyze",
  scanning: "Scanning for diseases...",
  diagnosisResult: "Diagnosis Result",
  confidence: "Confidence",
  descriptionAndTreatment: "Description & Treatment",
  looksHealthy: "Looks Healthy!",
  noDisease: "No significant disease was detected in the image.",
  placeholder: "Use your camera or upload an image and your diagnosis will appear here.",
};

export default function DiseaseDetectionPage() {
  const [result, setResult] = useState<AIDiseaseDetectionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState("camera");
  const { translatedText, T, isTranslating } = useTranslation(originalText);

  useEffect(() => {
    if (activeTab === 'camera') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: translatedText.cameraAccessRequired,
            description: translatedText.cameraAccessMessage,
          });
        }
      };

      getCameraPermission();
    } else {
      // Stop camera stream when switching away from the camera tab
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [activeTab, toast, translatedText]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const captureImageFromVideo = (): string | null => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  }

  async function handleDiagnose(photoDataUri: string) {
    setIsLoading(true);
    setResult(null);
    try {
      let detectionResult = await aiDiseaseDetection({ photoDataUri });
      setResult(detectionResult);
    } catch (error) {
      console.error('Error detecting disease:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onFileSubmit(values: z.infer<typeof formSchema>) {
    if (values.plantImage) {
      const file = values.plantImage[0];
      const photoDataUri = await fileToBase64(file);
      setPreview(photoDataUri);
      await handleDiagnose(photoDataUri);
    }
  }

  async function onCameraCapture() {
    const photoDataUri = captureImageFromVideo();
    if (photoDataUri) {
      setPreview(photoDataUri);
      await handleDiagnose(photoDataUri);
    } else {
      toast({
        title: 'Error',
        description: "Could not capture image from camera.",
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ScanLine className="text-primary" />
            <T textKey="title" />
          </CardTitle>
          <CardDescription>
            <T textKey="description" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera" disabled={isTranslating}><Camera className="mr-2"/><T textKey="liveCamera" /></TabsTrigger>
              <TabsTrigger value="upload" disabled={isTranslating}><File className="mr-2"/><T textKey="uploadFile" /></TabsTrigger>
            </TabsList>
            <TabsContent value="camera" className="mt-6">
              <div className="space-y-4">
                <div className="w-full aspect-video relative rounded-md overflow-hidden border bg-muted">
                    <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                </div>
                {hasCameraPermission === false && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle><T textKey="cameraAccessRequired" /></AlertTitle>
                    <AlertDescription>
                      <T textKey="cameraAccessMessage" />
                    </AlertDescription>
                  </Alert>
                )}
                <Button onClick={onCameraCapture} disabled={isLoading || !hasCameraPermission || isTranslating} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="mr-2 h-4 w-4" />
                  )}
                  <T textKey="captureAndDiagnose" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onFileSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="plantImage"
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel><T textKey="plantPhoto" /></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="file"
                              accept={ACCEPTED_IMAGE_TYPES.join(',')}
                              onChange={(e) => {
                                onChange(e.target.files);
                                handleFileChange(e);
                              }}
                              className="pt-2"
                              {...rest}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          <T textKey="uploadDescription" />
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {preview && activeTab === 'upload' && (
                    <div className="w-full aspect-video relative rounded-md overflow-hidden border">
                      <Image src={preview} alt="Image preview" fill className="object-cover" />
                    </div>
                  )}
                  <Button type="submit" disabled={isLoading || !form.formState.isValid || isTranslating} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ScanLine className="mr-2 h-4 w-4" />
                    )}
                    <T textKey="diagnose" />
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="lg:sticky top-6 space-y-4">
        {preview && (
          <Card>
            <CardHeader>
                <CardTitle className="font-headline"><T textKey="imageToAnalyze" /></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-video relative rounded-md overflow-hidden border">
                <Image src={preview} alt="Image preview" fill className="object-cover" />
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoading && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground"><T textKey="scanning" /></p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="font-headline"><T textKey="diagnosisResult" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.diseaseName.toLowerCase() !== 'healthy' ? (
                <>
                   <div className="flex items-center gap-2">
                    <AlertTriangle className="size-6 text-destructive" />
                    <h3 className="font-semibold text-lg font-headline">{result.diseaseName}</h3>
                  </div>
                  <div>
                    <p className="text-sm font-medium"><T textKey="confidence" /></p>
                    <Progress value={result.confidence * 100} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground text-right mt-1">
                        {(result.confidence * 100).toFixed(0)}% confident
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold"><T textKey="descriptionAndTreatment" /></h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.description}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="size-12 text-primary mx-auto" />
                  <h3 className="font-semibold text-lg font-headline mt-4"><T textKey="looksHealthy" /></h3>
                  <p className="text-muted-foreground mt-2">{result.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {!isLoading && !result && (
           <Card className="border-dashed">
             <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
               <Upload className="h-12 w-12 text-muted-foreground/50" />
               <p className="mt-4 text-muted-foreground"><T textKey="placeholder" /></p>
             </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
}
