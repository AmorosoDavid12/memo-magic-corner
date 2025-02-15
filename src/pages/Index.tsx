
import { useState } from "react";
import { 
  Search, 
  Settings, 
  FileText, 
  Plus, 
  Share2, 
  Clock, 
  Star,
  MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from "@/components/ui/sidebar";

const Index = () => {
  const [currentNote] = useState({
    title: "Post-mortem with The Brain",
    created: "November 23, 2023 1:26 PM",
    lastEdited: "November 23, 2023 1:28 PM",
    type: "Post-mortem",
    createdBy: "Harry Guinness",
    participants: "Empty",
    date: "Empty",
    content: {
      discussionPoints: [
        "The Brain's goal to take over the world",
        "Pinky's interference with The Brain's plans",
        "Analysis of Pinky's behavior and its impact on The Brain's strategies",
        "Brainstorming potential solutions to prevent Pinky from derailing world domination plans"
      ],
      actionItems: [
        "Conduct further research on Pinky's psychology and motivations",
        "Develop contingency plans to mitigate Pinky's influence on The Brain's operations"
      ]
    }
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <Sidebar>
          <div className="p-4">
            <Input
              type="text"
              placeholder="Search"
              className="w-full"
              prefix={<Search className="w-4 h-4 text-muted-foreground" />}
            />
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Teamspaces</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FileText className="w-4 h-4" />
                      <span>General</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FileText className="w-4 h-4" />
                      <span>Engineering Wiki</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FileText className="w-4 h-4" />
                      <span>Pinky Meeting Notes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="border-b p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                General
              </Button>
              <span>/</span>
              <Button variant="ghost" size="sm">
                Pinky Meeting Notes
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Clock className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Star className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Note Content */}
          <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{currentNote.title}</h1>
            
            {/* Metadata */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{currentNote.created}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Edited Time</p>
                  <p>{currentNote.lastEdited}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p>{currentNote.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p>{currentNote.createdBy}</p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Discussion Points */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Discussion Points</h2>
              <ul className="space-y-2">
                {currentNote.content.discussionPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Action Items</h2>
              <ul className="space-y-2">
                {currentNote.content.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Comment Section */}
            <div className="mt-8">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span>Add a comment...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
