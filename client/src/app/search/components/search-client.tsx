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
import { useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

// Define a type for uploaded files
type UploadedFile = {
  name: string;
  content: string;
};

export function SearchClient() {
  // Sequence search state
  const [fastaFiles, setFastaFiles] = useState<UploadedFile[]>([]);
  const [searchAlgorithm, setSearchAlgorithm] = useState("diamond");
  const [searchCompleteSetOnly, setSearchCompleteSetOnly] = useState(false);
  const [isSequenceSearchLoading, setIsSequenceSearchLoading] = useState(false);
  const fastaFileInputRef = useRef<HTMLInputElement>(null);

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

  // Function to poll job status
  const pollSequenceJobStatus = async (jobId: string) => {
    if (!jobId) return;

    setIsPollingSequenceJob(true);

    try {
      const response = await fetch(`/api/search/status/${jobId}?type=sequence`);

      if (!response.ok) {
        throw new Error('Failed to get job status');
      }

      const data = await response.json();

      setSequenceJobStatus(data.state);
      setSequenceJobProgress(data.progress || 0);

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

  // Function to poll BGC job status
  const pollBgcJobStatus = async (jobId: string) => {
    if (!jobId) return;

    setIsPollingBgcJob(true);

    try {
      const response = await fetch(`/api/search/status/${jobId}?type=bgc`);

      if (!response.ok) {
        throw new Error('Failed to get job status');
      }

      const data = await response.json();

      setBgcJobStatus(data.state);
      setBgcJobProgress(data.progress || 0);

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
      </CardContent>
    </Card>
  );
}
