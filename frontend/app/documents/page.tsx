"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { TableOfContents } from "@/components/ui/table-of-contents";
import { FileText, Calendar, FolderOpen, PanelLeftClose, PanelRightClose } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  format: string;
  version: string | null;
  author: string | null;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export default function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showDocList, setShowDocList] = useState(true);
  const [showTOC, setShowTOC] = useState(true);

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8001/api/v1/documents/");
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
  });

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Documents"
        createLabel="New Document"
        onCreateClick={() => {
          console.log("Create document clicked");
        }}
      />

      <div className="flex-1 flex gap-4 p-6 overflow-hidden">
        {/* Documents List */}
        {showDocList && (
          <Card className={cn(
            "flex-shrink-0 transition-all duration-300",
            showDocList ? "w-80" : "w-0"
          )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Documents ({documents?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {isLoading && (
                <p className="text-sm text-muted-foreground p-4">Loading...</p>
              )}

              {documents && documents.length === 0 && (
                <p className="text-sm text-muted-foreground p-4">
                  No documents found
                </p>
              )}

              {documents?.map((doc) => (
                <div key={doc.id}>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                      selectedDoc?.id === doc.id ? "bg-accent" : ""
                    }`}
                  >
                    <h3 className="font-medium text-sm line-clamp-1">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {doc.type}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                  <Separator />
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          </Card>
        )}

        {/* Document Viewer */}
        <Card className="flex-1 overflow-hidden relative">
          {selectedDoc ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {!showDocList && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDocList(true)}
                        className="h-8 w-8"
                      >
                        <PanelLeftClose className="h-4 w-4 rotate-180" />
                      </Button>
                    )}
                    <div>
                      <CardTitle className="text-2xl">
                        {selectedDoc.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-4 w-4" />
                          {selectedDoc.type}
                        </span>
                        {selectedDoc.version && (
                          <span>Version {selectedDoc.version}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Updated {new Date(selectedDoc.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {showDocList && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDocList(false)}
                        className="h-8 w-8"
                      >
                        <PanelLeftClose className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowTOC(!showTOC)}
                      className="h-8 w-8"
                    >
                      <PanelRightClose className={cn(
                        "h-4 w-4 transition-transform",
                        !showTOC && "rotate-180"
                      )} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="p-6">
                    <MarkdownRenderer content={selectedDoc.content} />
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Select a document to view</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Table of Contents */}
        {selectedDoc && showTOC && (
          <Card className={cn(
            "flex-shrink-0 transition-all duration-300",
            showTOC ? "w-64" : "w-0"
          )}>
            <CardHeader>
              <CardTitle className="text-sm">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <TableOfContents content={selectedDoc.content} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}