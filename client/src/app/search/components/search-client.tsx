"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

// Define a type for uploaded files
type UploadedFile = {
  name: string;
  content: string;
};

// Define a type for job history
type JobHistoryItem = {
  jobId: string;
  type: "sequence" | "bgc";
  timestamp: number;
};

// Cookie constants
const JOB_HISTORY_COOKIE_NAME = "job_history";
const JOB_HISTORY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const JOB_HISTORY_MAX_ITEMS = 10;

export function SearchClient() {
  // Sequence search state
  const [fastaFiles, setFastaFiles] = useState<UploadedFile[]>([]);
  const [searchAlgorithm, setSearchAlgorithm] = useState("diamond");
  const [searchCompleteSetOnly, setSearchCompleteSetOnly] = useState(false);
  const [isSequenceSearchLoading, setIsSequenceSearchLoading] = useState(false);
  const fastaFileInputRef = useRef<HTMLInputElement>(null);

  // Job history state
  const [jobHistory, setJobHistory] = useState<JobHistoryItem[]>([]);

  // BGC search state
  const [gbkFiles, setGbkFiles] = useState<UploadedFile[]>([]);
  const [isBgcSearchLoading, setIsBgcSearchLoading] = useState(false);
  const gbkFileInputRef = useRef<HTMLInputElement>(null);

  const handleFastaFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setFastaFiles(prev => [...prev, { name: file.name, content }]);
        };
        reader.readAsText(file);
      });
    }
    // Reset the input value so the same file can be selected again
    if (fastaFileInputRef.current) {
      fastaFileInputRef.current.value = '';
    }
  };

  const handleFastaBrowseClick = () => {
    fastaFileInputRef.current?.click();
  };

  const handleRemoveFastaFile = (index: number) => {
    setFastaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGbkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setGbkFiles(prev => [...prev, { name: file.name, content }]);
        };
        reader.readAsText(file);
      });
    }
    // Reset the input value so the same file can be selected again
    if (gbkFileInputRef.current) {
      gbkFileInputRef.current.value = '';
    }
  };

  const handleGbkBrowseClick = () => {
    gbkFileInputRef.current?.click();
  };

  const handleRemoveGbkFile = (index: number) => {
    setGbkFiles(prev => prev.filter((_, i) => i !== index));
  };

  // State for job tracking
  const [sequenceJobId, setSequenceJobId] = useState<string | null>(null);
  const [sequenceJobStatus, setSequenceJobStatus] = useState<string | null>(null);
  const [sequenceJobProgress, setSequenceJobProgress] = useState<number>(0);
  const [sequenceJobResults, setSequenceJobResults] = useState<any>(null);
  const [isPollingSequenceJob, setIsPollingSequenceJob] = useState<boolean>(false);
  const [sequenceQueueStats, setSequenceQueueStats] = useState<{
    totalJobs: number;
    activeJobs: number;
    waitingJobs: number;
    queuePosition: number;
  } | null>(null);

  // Function to poll job status
  const pollSequenceJobStatus = async (jobId: string) => {
    if (!jobId) return;

    setIsPollingSequenceJob(true);

    try {
      const response = await fetch(`/api/search/status/${jobId}`);

      if (!response.ok) {
        throw new Error('Failed to get job status');
      }

      const data = await response.json();

      setSequenceJobStatus(data.state);
      setSequenceJobProgress(data.progress || 0);

      // Store queue statistics if available
      if (data.queueStats) {
        setSequenceQueueStats(data.queueStats);

        // Also update the combined queue stats
        setQueueStats({
          ...data.queueStats,
          queuePosition: 0 // Reset position for the overall view
        });
      }

      if (data.state === 'completed' && data.result) {
        setSequenceJobResults(data.result);
        setIsPollingSequenceJob(false);

        toast({
          title: "Search completed",
          description: "Your sequence search has completed successfully.",
        });
      } else if (data.state === 'failed') {
        setIsPollingSequenceJob(false);

        toast({
          title: "Search failed",
          description: "Your sequence search has failed. Please try again.",
          variant: "destructive",
        });
      } else {
        // Continue polling if job is still in progress
        setTimeout(() => pollSequenceJobStatus(jobId), 2000);
      }
    } catch (error) {
      console.error('Error polling job status:', error);
      setIsPollingSequenceJob(false);

      toast({
        title: "Error",
        description: "Failed to get job status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle sequence search
  const handleSequenceSearch = async () => {
    if (fastaFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one FASTA file.",
        variant: "destructive",
      });
      return;
    }

    setIsSequenceSearchLoading(true);
    // Reset previous job data
    setSequenceJobId(null);
    setSequenceJobStatus(null);
    setSequenceJobProgress(0);
    setSequenceJobResults(null);
    setSequenceQueueStats(null);

    try {
      // Create a FormData object to send the files
      const formData = new FormData();

      // Convert the file content back to Blob objects and append to FormData
      for (const file of fastaFiles) {
        const blob = new Blob([file.content], { type: 'text/plain' });
        formData.append('files', blob, file.name);
      }

      // Send the files to the server
      const response = await fetch('/api/search/sequence', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const data = await response.json();

      toast({
        title: "Files uploaded successfully",
        description: `Job queued with ID: ${data.jobId}`,
      });

      // Store the job ID and start polling for status
      setSequenceJobId(data.jobId);
      pollSequenceJobStatus(data.jobId);

      // Add job to history
      addJobToHistory(data.jobId, "sequence");

    } catch (error) {
      console.error('Error during sequence search:', error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSequenceSearchLoading(false);
    }
  };

  // State for BGC job tracking
  const [bgcJobId, setBgcJobId] = useState<string | null>(null);
  const [bgcJobStatus, setBgcJobStatus] = useState<string | null>(null);
  const [bgcJobProgress, setBgcJobProgress] = useState<number>(0);
  const [bgcJobResults, setBgcJobResults] = useState<any>(null);
  const [isPollingBgcJob, setIsPollingBgcJob] = useState<boolean>(false);
  const [bgcQueueStats, setBgcQueueStats] = useState<{
    totalJobs: number;
    activeJobs: number;
    waitingJobs: number;
    queuePosition: number;
  } | null>(null);

  // State for combined queue statistics
  const [queueStats, setQueueStats] = useState<{
    totalJobs: number;
    activeJobs: number;
    waitingJobs: number;
    queuePosition: number;
  } | null>(null);

  // State for job UUID search
  const [jobUuid, setJobUuid] = useState<string>("");
  const [isLoadingJobUuid, setIsLoadingJobUuid] = useState<boolean>(false);

  // Function to handle job retrieval by UUID
  const handleJobUuidSearch = async (providedUuid?: string) => {
    const uuidToUse = providedUuid || jobUuid;

    if (!uuidToUse.trim()) {
      toast({
        title: "No UUID provided",
        description: "Please enter a job UUID to search.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingJobUuid(true);

    try {
      const response = await fetch(`/api/search/status/${uuidToUse}`);

      if (!response.ok) {
        throw new Error('Failed to retrieve job');
      }

      const data = await response.json();
      const type = data.type; // Get the job type from the API response

      // Set the appropriate job state based on the job type
      if (type === 'sequence') {
        setSequenceJobId(uuidToUse);
        setSequenceJobStatus(data.state);
        setSequenceJobProgress(data.progress || 0);
        if (data.result) {
          setSequenceJobResults(data.result);
        }
        if (data.queueStats) {
          setSequenceQueueStats(data.queueStats);
        }

        // If job is still in progress, start polling
        if (data.state !== 'completed' && data.state !== 'failed') {
          pollSequenceJobStatus(uuidToUse);
        }

        // Add job to history
        addJobToHistory(uuidToUse, "sequence");
      } else if (type === 'bgc') {
        setBgcJobId(uuidToUse);
        setBgcJobStatus(data.state);
        setBgcJobProgress(data.progress || 0);
        if (data.result) {
          setBgcJobResults(data.result);
        }
        if (data.queueStats) {
          setBgcQueueStats(data.queueStats);
        }

        // If job is still in progress, start polling
        if (data.state !== 'completed' && data.state !== 'failed') {
          pollBgcJobStatus(uuidToUse);
        }

        // Add job to history
        addJobToHistory(uuidToUse, "bgc");
      }

      // Update the input field with the UUID we just used
      if (providedUuid) {
        setJobUuid(providedUuid);
      }

      toast({
        title: "Job retrieved",
        description: `Job ${uuidToUse} retrieved successfully.`,
      });
    } catch (error) {
      console.error('Error retrieving job:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve job. Please check the UUID and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingJobUuid(false);
    }
  };

  // Function to fetch queue statistics
  const fetchQueueStats = async () => {
    try {
      // Fetch overall queue statistics (without type filter)
      const response = await fetch('/api/search/queue-stats');
      if (response.ok) {
        const data = await response.json();
        if (data.queueStats) {
          setQueueStats({
            ...data.queueStats,
            queuePosition: 0 // No specific job, so no queue position
          });

          // Also update the individual stats for backward compatibility
          // with job status displays
          setSequenceQueueStats({
            ...data.queueStats,
            queuePosition: 0
          });
          setBgcQueueStats({
            ...data.queueStats,
            queuePosition: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching queue statistics:', error);
    }
  };

  // Helper functions for job history cookie management
  const getJobHistoryFromCookie = (): JobHistoryItem[] => {
    if (typeof document === 'undefined') return []; // Server-side rendering check

    const cookies = document.cookie.split(';');
    const jobHistoryCookie = cookies.find(cookie => cookie.trim().startsWith(`${JOB_HISTORY_COOKIE_NAME}=`));

    if (!jobHistoryCookie) return [];

    try {
      const jobHistoryValue = jobHistoryCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(jobHistoryValue));
    } catch (error) {
      console.error('Error parsing job history cookie:', error);
      return [];
    }
  };

  const saveJobHistoryToCookie = (history: JobHistoryItem[]) => {
    if (typeof document === 'undefined') return; // Server-side rendering check

    // Limit the number of items in history
    const limitedHistory = history.slice(0, JOB_HISTORY_MAX_ITEMS);

    // Save to cookie
    const jobHistoryValue = encodeURIComponent(JSON.stringify(limitedHistory));
    document.cookie = `${JOB_HISTORY_COOKIE_NAME}=${jobHistoryValue}; path=/; max-age=${JOB_HISTORY_COOKIE_MAX_AGE}`;
  };

  const addJobToHistory = (jobId: string, type: "sequence" | "bgc") => {
    const newJob: JobHistoryItem = {
      jobId,
      type,
      timestamp: Date.now()
    };

    // Add to state
    const updatedHistory = [newJob, ...jobHistory.filter(job => job.jobId !== jobId)];
    setJobHistory(updatedHistory);

    // Save to cookie
    saveJobHistoryToCookie(updatedHistory);
  };

  // Load job history from cookie when component mounts
  useEffect(() => {
    const history = getJobHistoryFromCookie();
    setJobHistory(history);
  }, []);

  // Fetch queue statistics when the component mounts and periodically
  useEffect(() => {
    // Fetch queue statistics immediately
    fetchQueueStats();

    // Set up interval to fetch queue statistics every 10 seconds
    const intervalId = setInterval(fetchQueueStats, 10000);

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Function to poll BGC job status
  const pollBgcJobStatus = async (jobId: string) => {
    if (!jobId) return;

    setIsPollingBgcJob(true);

    try {
      const response = await fetch(`/api/search/status/${jobId}`);

      if (!response.ok) {
        throw new Error('Failed to get job status');
      }

      const data = await response.json();

      setBgcJobStatus(data.state);
      setBgcJobProgress(data.progress || 0);

      // Store queue statistics if available
      if (data.queueStats) {
        setBgcQueueStats(data.queueStats);
      }

      if (data.state === 'completed' && data.result) {
        setBgcJobResults(data.result);
        setIsPollingBgcJob(false);

        toast({
          title: "Search completed",
          description: "Your BGC search has completed successfully.",
        });
      } else if (data.state === 'failed') {
        setIsPollingBgcJob(false);

        toast({
          title: "Search failed",
          description: "Your BGC search has failed. Please try again.",
          variant: "destructive",
        });
      } else {
        // Continue polling if job is still in progress
        setTimeout(() => pollBgcJobStatus(jobId), 2000);
      }
    } catch (error) {
      console.error('Error polling job status:', error);
      setIsPollingBgcJob(false);

      toast({
        title: "Error",
        description: "Failed to get job status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle BGC search
  const handleBgcSearch = async () => {
    if (gbkFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one GenBank file.",
        variant: "destructive",
      });
      return;
    }

    setIsBgcSearchLoading(true);
    // Reset previous job data
    setBgcJobId(null);
    setBgcJobStatus(null);
    setBgcJobProgress(0);
    setBgcJobResults(null);
    setBgcQueueStats(null);

    try {
      // Create a FormData object to send the files
      const formData = new FormData();

      // Convert the file content back to Blob objects and append to FormData
      for (const file of gbkFiles) {
        const blob = new Blob([file.content], { type: 'text/plain' });
        formData.append('files', blob, file.name);
      }

      // Send the files to the server
      const response = await fetch('/api/search/bgc', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const data = await response.json();

      toast({
        title: "Files uploaded successfully",
        description: `Job queued with ID: ${data.jobId}`,
      });

      // Store the job ID and start polling for status
      setBgcJobId(data.jobId);
      pollBgcJobStatus(data.jobId);

      // Add job to history
      addJobToHistory(data.jobId, "bgc");

    } catch (error) {
      console.error('Error during BGC search:', error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBgcSearchLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Queue Statistics Display */}
        <div className="mb-6 p-4 bg-muted rounded-md">
          <h3 className="font-semibold mb-2">Current Queue Status</h3>
          <div>
            {queueStats ? (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Jobs:</span> {queueStats.totalJobs}
                </div>
                <div>
                  <span className="font-medium">Running Jobs:</span> {queueStats.activeJobs}
                </div>
                <div>
                  <span className="font-medium">Queued Jobs:</span> {queueStats.waitingJobs}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading queue statistics...</p>
            )}
          </div>
        </div>


        <Tabs defaultValue="metadata">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metadata">Metadata Search</TabsTrigger>
            <TabsTrigger value="sequence">Sequence Search</TabsTrigger>
            <TabsTrigger value="bgc">BGC Search</TabsTrigger>
          </TabsList>
          <TabsContent value="metadata" className="mt-6">
            <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bgc-id">BGC ID</Label>
                <Input id="bgc-id" placeholder="e.g., BGC0001234" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gcf-id">GCF ID</Label>
                <Input id="gcf-id" placeholder="e.g., GCF_000567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxon">Taxonomy</Label>
                <Input id="taxon" placeholder="e.g., Streptomyces" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Cluster Class</Label>
                <Input id="class" placeholder="e.g., PKS" />
              </div>
              <div className="col-span-full">
                <Button type="submit">Search</Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="sequence" className="mt-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">
                  Upload FASTA files containing annotated protein sequences in multi-fasta format. Each file should represent one BGC.
                </p>
              </div>
              <div 
                className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    Array.from(files).forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        setFastaFiles(prev => [...prev, { name: file.name, content }]);
                      };
                      reader.readAsText(file);
                    });
                  }
                }}
              >
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Drag & drop FASTA files</p>
                <p className="text-sm text-muted-foreground">or</p>
                <Button variant="outline" className="mt-2" onClick={handleFastaBrowseClick}>
                  Browse files
                </Button>
                <input
                  type="file"
                  ref={fastaFileInputRef}
                  onChange={handleFastaFileSelect}
                  accept=".fasta,.fa,.txt"
                  className="hidden"
                  multiple
                />
              </div>

              {fastaFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="border rounded-md p-4 space-y-2">
                    {fastaFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveFastaFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 border rounded-md p-4">
                <h3 className="font-semibold">Search Options</h3>

                <div className="space-y-2">
                  <Label>Search Algorithm</Label>
                  <RadioGroup 
                    value={searchAlgorithm} 
                    onValueChange={setSearchAlgorithm}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="diamond" id="diamond" />
                      <Label htmlFor="diamond">Diamond</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blastp" id="blastp" />
                      <Label htmlFor="blastp">BlastP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cblaster" id="cblaster" />
                      <Label htmlFor="cblaster">CBlaster</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="complete-set-only" 
                    checked={searchCompleteSetOnly}
                    onCheckedChange={(checked) => 
                      setSearchCompleteSetOnly(checked === true)
                    }
                  />
                  <Label htmlFor="complete-set-only">
                    Search only in the complete set of BGCs
                  </Label>
                </div>
              </div>

              <Button 
                onClick={handleSequenceSearch} 
                disabled={isSequenceSearchLoading}
              >
                {isSequenceSearchLoading ? "Uploading..." : "Search with Sequence"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="bgc" className="mt-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">
                  Upload GenBank (GBK) files containing BGC information. The search will be conducted using BigSLiCE to find similar BGCs in the database.
                </p>
              </div>

              <div 
                className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    Array.from(files).forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        setGbkFiles(prev => [...prev, { name: file.name, content }]);
                      };
                      reader.readAsText(file);
                    });
                  }
                }}
              >
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Drag & drop GenBank files</p>
                <p className="text-sm text-muted-foreground">or</p>
                <Button variant="outline" className="mt-2" onClick={handleGbkBrowseClick}>
                  Browse files
                </Button>
                <input
                  type="file"
                  ref={gbkFileInputRef}
                  onChange={handleGbkFileSelect}
                  accept=".gbk,.gb,.genbank"
                  className="hidden"
                  multiple
                />
              </div>

              {gbkFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="border rounded-md p-4 space-y-2">
                    {gbkFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveGbkFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleBgcSearch} 
                disabled={isBgcSearchLoading}
              >
                {isBgcSearchLoading ? "Uploading..." : "Search with BGC"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <div>
          <h2 className="font-headline text-2xl font-bold">Results</h2>

          {/* Job Status Display */}
          {(sequenceJobId || bgcJobId) && (
            <div className="mt-4 mb-6">
              <h3 className="font-semibold mb-2">Job Status</h3>

              {sequenceJobId && (
                <div className="bg-muted p-4 rounded-md mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">Sequence Search Job:</span> {sequenceJobId}
                    </div>
                    <div className="text-sm">
                      Status: <span className={`font-semibold ${
                        sequenceJobStatus === 'completed' ? 'text-green-600' : 
                        sequenceJobStatus === 'failed' ? 'text-red-600' : 
                        'text-amber-600'
                      }`}>
                        {sequenceJobStatus || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${sequenceJobProgress}%` }}
                    ></div>
                  </div>

                  {/* Queue statistics */}
                  {sequenceQueueStats && (
                    <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Total Jobs:</span> {sequenceQueueStats.totalJobs}
                      </div>
                      <div>
                        <span className="font-medium">Running Jobs:</span> {sequenceQueueStats.activeJobs}
                      </div>
                      <div>
                        <span className="font-medium">Queued Jobs:</span> {sequenceQueueStats.waitingJobs}
                      </div>
                      {sequenceQueueStats.queuePosition > 0 && (
                        <div>
                          <span className="font-medium">Queue Position:</span> {sequenceQueueStats.queuePosition}
                        </div>
                      )}
                    </div>
                  )}

                  {isPollingSequenceJob && (
                    <p className="text-xs text-muted-foreground mt-1">Waiting for results...</p>
                  )}
                </div>
              )}

              {bgcJobId && (
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">BGC Search Job:</span> {bgcJobId}
                    </div>
                    <div className="text-sm">
                      Status: <span className={`font-semibold ${
                        bgcJobStatus === 'completed' ? 'text-green-600' : 
                        bgcJobStatus === 'failed' ? 'text-red-600' : 
                        'text-amber-600'
                      }`}>
                        {bgcJobStatus || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${bgcJobProgress}%` }}
                    ></div>
                  </div>

                  {/* Queue statistics */}
                  {bgcQueueStats && (
                    <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Total Jobs:</span> {bgcQueueStats.totalJobs}
                      </div>
                      <div>
                        <span className="font-medium">Running Jobs:</span> {bgcQueueStats.activeJobs}
                      </div>
                      <div>
                        <span className="font-medium">Queued Jobs:</span> {bgcQueueStats.waitingJobs}
                      </div>
                      {bgcQueueStats.queuePosition > 0 && (
                        <div>
                          <span className="font-medium">Queue Position:</span> {bgcQueueStats.queuePosition}
                        </div>
                      )}
                    </div>
                  )}

                  {isPollingBgcJob && (
                    <p className="text-xs text-muted-foreground mt-1">Waiting for results...</p>
                  )}
                </div>
              )}
            </div>
          )}

          <Tabs defaultValue="bgcs-results" className="mt-4">
            <TabsList>
              <TabsTrigger value="bgcs-results">BGCs</TabsTrigger>
              <TabsTrigger value="gcfs-results">GCFs</TabsTrigger>
              <TabsTrigger value="samples-results">Samples</TabsTrigger>
              <TabsTrigger value="taxa-results">Taxa</TabsTrigger>
            </TabsList>

            <TabsContent value="bgcs-results" className="mt-4">
              {(sequenceJobResults || bgcJobResults) ? (
                <div className="border rounded-md p-4">
                  {sequenceJobResults && sequenceJobResults.results && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Sequence Search Results</h4>
                      {sequenceJobResults.results.matches && sequenceJobResults.results.matches.length > 0 ? (
                        <div className="space-y-2">
                          {sequenceJobResults.results.matches.map((match, index) => (
                            <div key={index} className="bg-muted p-3 rounded-md">
                              <div className="flex justify-between">
                                <span className="font-medium">{match.id}</span>
                                <span>Similarity: {(match.similarity * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No matches found.</p>
                      )}
                    </div>
                  )}

                  {bgcJobResults && bgcJobResults.results && (
                    <div>
                      <h4 className="font-semibold mb-2">BGC Search Results</h4>
                      {bgcJobResults.results.matches && bgcJobResults.results.matches.length > 0 ? (
                        <div className="space-y-2">
                          {bgcJobResults.results.matches.map((match, index) => (
                            <div key={index} className="bg-muted p-3 rounded-md">
                              <div className="flex justify-between">
                                <span className="font-medium">{match.id}</span>
                                <span>Similarity: {(match.similarity * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No matches found.</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Search results will appear here.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="gcfs-results" className="mt-4">
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Search results will appear here.</p>
              </div>
            </TabsContent>

            <TabsContent value="samples-results" className="mt-4">
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Search results will appear here.</p>
              </div>
            </TabsContent>

            <TabsContent value="taxa-results" className="mt-4">
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Search results will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="my-8" />

        {/* Job UUID Search */}
        <div className="mt-8 p-4 border rounded-md">
          <h3 className="font-semibold mb-4">Retrieve Previous Job</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-uuid">Job UUID</Label>
              <Input 
                id="job-uuid" 
                placeholder="Enter job UUID" 
                value={jobUuid}
                onChange={(e) => setJobUuid(e.target.value)}
              />
            </div>


            <Button 
              onClick={handleJobUuidSearch} 
              disabled={isLoadingJobUuid}
            >
              {isLoadingJobUuid ? "Loading..." : "Retrieve Job"}
            </Button>
          </div>
        </div>

        {/* Job History */}
        {jobHistory.length > 0 && (
          <div className="mt-8 p-4 border rounded-md">
            <h3 className="font-semibold mb-4">Your Recent Jobs</h3>
            <div className="space-y-2">
              {jobHistory.map((job) => (
                <div 
                  key={job.jobId} 
                  className="flex items-center justify-between bg-muted p-3 rounded-md"
                >
                  <div>
                    <div className="font-medium">{job.type === "sequence" ? "Sequence Search" : "BGC Search"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(job.timestamp).toLocaleString()} - {job.jobId}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJobUuidSearch(job.jobId)}
                  >
                    Load Results
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
