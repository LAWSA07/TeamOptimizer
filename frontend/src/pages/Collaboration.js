import React, { useState, useEffect } from 'react';
import {
  Box, Heading, VStack, HStack, Card, CardBody, CardHeader, Button, Text, Badge, 
  Textarea, Select, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  List, ListItem, ListIcon, useToast, Tabs, TabList, TabPanels, Tab, TabPanel,
  Alert, AlertIcon, Stat, StatLabel, StatNumber, StatHelpText, Progress, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Input
} from '@chakra-ui/react';
import { 
  ChatIcon, CheckCircleIcon, WarningIcon, InfoIcon, BellIcon, 
  StarIcon, TimeIcon, CheckIcon, CloseIcon 
} from '@chakra-ui/icons';
import API_URL from '../config';

const FEEDBACK_TYPES = [
  { value: 'team_composition', label: 'Team Composition' },
  { value: 'workload_balance', label: 'Workload Balance' },
  { value: 'skill_match', label: 'Skill Match' },
  { value: 'diversity', label: 'Diversity' },
  { value: 'general', label: 'General' }
];

const APPROVAL_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'requested_changes', label: 'Changes Requested', color: 'orange' }
];

export default function Collaboration() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [comments, setComments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: '1', name: 'Current User' });
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeModal, setActiveModal] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchCollaborationData();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects/`);
      const data = await response.json();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id || data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchCollaborationData = async () => {
    setLoading(true);
    try {
      const [feedbackRes, approvalsRes, commentsRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/collaboration/feedback/${selectedProject}`),
        fetch(`${API_URL}/collaboration/approvals/${selectedProject}`),
        fetch(`${API_URL}/collaboration/comments/${selectedProject}`),
        fetch(`${API_URL}/collaboration/summary/${selectedProject}`)
      ]);

      const feedbackData = await feedbackRes.json();
      const approvalsData = await approvalsRes.json();
      const commentsData = await commentsRes.json();
      const summaryData = await summaryRes.json();

      setFeedback(feedbackData);
      setApprovals(approvalsData);
      setComments(commentsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching collaboration data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch collaboration data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      const response = await fetch(`${API_URL}/collaboration/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackData,
          project_id: selectedProject,
          user_id: currentUser.id,
          user_name: currentUser.name
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Feedback submitted successfully',
          status: 'success',
          duration: 3000,
        });
        fetchCollaborationData();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmitComment = async (commentData) => {
    try {
      const response = await fetch(`${API_URL}/collaboration/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...commentData,
          project_id: selectedProject,
          user_id: currentUser.id,
          user_name: currentUser.name
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Comment added successfully',
          status: 'success',
          duration: 3000,
        });
        fetchCollaborationData();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleApprovalAction = async (approvalId, status, notes = '') => {
    try {
      const response = await fetch(`${API_URL}/collaboration/approvals/${approvalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Approval ${status}`,
          status: 'success',
          duration: 3000,
        });
        fetchCollaborationData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update approval',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openModal = (modalType) => {
    setActiveModal(modalType);
    onOpen();
  };

  const renderFeedbackModal = () => (
    <Modal isOpen={isOpen && activeModal === 'feedback'} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Submit Feedback</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FeedbackForm onSubmit={handleSubmitFeedback} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  const renderCommentModal = () => (
    <Modal isOpen={isOpen && activeModal === 'comment'} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Comment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CommentForm onSubmit={handleSubmitComment} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return (
    <Box maxW="6xl" mx="auto" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg" color="pueblo.700">Team Collaboration</Heading>
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            w="300px"
          >
            {projects.map((project) => (
              <option key={project.id || project._id} value={project.id || project._id}>
                {project.name}
              </option>
            ))}
          </Select>
        </HStack>

        {summary && (
          <Card bg="pueblo.50" shadow="sm">
            <CardHeader>
              <Heading size="md" color="pueblo.700">Collaboration Summary</Heading>
            </CardHeader>
            <CardBody>
              <HStack spacing={8}>
                <Stat>
                  <StatLabel>Overall Satisfaction</StatLabel>
                  <StatNumber color="pueblo.600">
                    {(summary.overall_satisfaction * 100).toFixed(1)}%
                  </StatNumber>
                  <StatHelpText>
                    <Progress value={summary.overall_satisfaction * 100} colorScheme="pueblo" size="sm" />
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Feedback Count</StatLabel>
                  <StatNumber color="pueblo.600">{summary.feedback_count}</StatNumber>
                  <StatHelpText>Total feedback received</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Average Rating</StatLabel>
                  <StatNumber color="pueblo.600">{summary.average_rating.toFixed(1)}/5</StatNumber>
                  <StatHelpText>Based on feedback</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Pending Approvals</StatLabel>
                  <StatNumber color="pueblo.600">
                    {summary.approval_requests.filter(a => a.status === 'pending').length}
                  </StatNumber>
                  <StatHelpText>Awaiting review</StatHelpText>
                </Stat>
              </HStack>
            </CardBody>
          </Card>
        )}

        <Tabs variant="enclosed" colorScheme="pueblo">
          <TabList>
            <Tab>Feedback</Tab>
            <Tab>Approvals</Tab>
            <Tab>Comments</Tab>
            <Tab>Notifications</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <FeedbackTab 
                feedback={feedback} 
                onAddFeedback={() => openModal('feedback')}
                loading={loading}
              />
            </TabPanel>
            
            <TabPanel>
              <ApprovalsTab 
                approvals={approvals} 
                onApprovalAction={handleApprovalAction}
                loading={loading}
              />
            </TabPanel>
            
            <TabPanel>
              <CommentsTab 
                comments={comments} 
                onAddComment={() => openModal('comment')}
                loading={loading}
              />
            </TabPanel>
            
            <TabPanel>
              <NotificationsTab 
                notifications={notifications}
                loading={loading}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {renderFeedbackModal()}
        {renderCommentModal()}
      </VStack>
    </Box>
  );
}

// Feedback Tab Component
function FeedbackTab({ feedback, onAddFeedback, loading }) {
  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="md" color="pueblo.700">Project Feedback</Heading>
        <Button colorScheme="pueblo" onClick={onAddFeedback} leftIcon={<StarIcon />}>
          Add Feedback
        </Button>
      </HStack>

      {loading ? (
        <Text>Loading feedback...</Text>
      ) : feedback.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No feedback yet. Be the first to provide feedback!
        </Alert>
      ) : (
        <VStack spacing={4} align="stretch">
          {feedback.map((item) => (
            <Card key={item.id} bg="white" shadow="sm">
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <HStack>
                      <Badge colorScheme="pueblo">{item.feedback_type}</Badge>
                      <Text fontWeight="bold">{item.user_name}</Text>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                      <HStack spacing={1}>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            color={i < item.rating ? "pueblo.500" : "gray.300"} 
                            boxSize={4}
                          />
                        ))}
                      </HStack>
                    </HStack>
                  </HStack>
                  <Text>{item.comment}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

// Approvals Tab Component
function ApprovalsTab({ approvals, onApprovalAction, loading }) {
  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md" color="pueblo.700">Approval Requests</Heading>

      {loading ? (
        <Text>Loading approvals...</Text>
      ) : approvals.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No approval requests found.
        </Alert>
      ) : (
        <VStack spacing={4} align="stretch">
          {approvals.map((approval) => (
            <Card key={approval.id} bg="white" shadow="sm">
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Request by {approval.requester_name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        For: {approval.approver_name}
                      </Text>
                    </VStack>
                    <Badge colorScheme={APPROVAL_STATUSES.find(s => s.value === approval.status)?.color}>
                      {approval.status}
                    </Badge>
                  </HStack>
                  
                  <Text>{approval.request_reason}</Text>
                  
                  {approval.approval_notes && (
                    <Alert status="info" size="sm">
                      <AlertIcon />
                      {approval.approval_notes}
                    </Alert>
                  )}
                  
                  <Text fontSize="sm" color="gray.500">
                    Created: {new Date(approval.created_at).toLocaleDateString()}
                  </Text>
                  
                  {approval.status === 'pending' && (
                    <HStack spacing={2}>
                      <Button 
                        size="sm" 
                        colorScheme="green" 
                        onClick={() => onApprovalAction(approval.id, 'approved')}
                        leftIcon={<CheckIcon />}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        onClick={() => onApprovalAction(approval.id, 'rejected')}
                        leftIcon={<CloseIcon />}
                      >
                        Reject
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

// Comments Tab Component
function CommentsTab({ comments, onAddComment, loading }) {
  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="md" color="pueblo.700">Project Comments</Heading>
        <Button colorScheme="pueblo" onClick={onAddComment} leftIcon={<ChatIcon />}>
          Add Comment
        </Button>
      </HStack>

      {loading ? (
        <Text>Loading comments...</Text>
      ) : comments.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No comments yet. Start the conversation!
        </Alert>
      ) : (
        <VStack spacing={4} align="stretch">
          {comments.map((comment) => (
            <Card key={comment.id} bg="white" shadow="sm">
              <CardBody>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">{comment.user_name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </HStack>
                  <Text>{comment.content}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

// Notifications Tab Component
function NotificationsTab({ notifications, loading }) {
  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md" color="pueblo.700">Notifications</Heading>

      {loading ? (
        <Text>Loading notifications...</Text>
      ) : notifications.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No notifications to display.
        </Alert>
      ) : (
        <VStack spacing={4} align="stretch">
          {notifications.map((notification) => (
            <Card key={notification.id} bg="white" shadow="sm">
              <CardBody>
                <HStack spacing={3}>
                  <BellIcon color="pueblo.500" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="bold">{notification.title}</Text>
                    <Text fontSize="sm">{notification.message}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                  {!notification.read && (
                    <Badge colorScheme="pueblo" size="sm">New</Badge>
                  )}
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

// Feedback Form Component
function FeedbackForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    feedback_type: 'general',
    rating: 3,
    comment: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Feedback Type</FormLabel>
          <Select
            value={formData.feedback_type}
            onChange={(e) => setFormData({...formData, feedback_type: e.target.value})}
          >
            {FEEDBACK_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Rating (1-5)</FormLabel>
          <NumberInput
            min={1}
            max={5}
            value={formData.rating}
            onChange={(value) => setFormData({...formData, rating: parseInt(value)})}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Comment</FormLabel>
          <Textarea
            value={formData.comment}
            onChange={(e) => setFormData({...formData, comment: e.target.value})}
            placeholder="Share your feedback..."
            rows={4}
          />
        </FormControl>

        <Button type="submit" colorScheme="pueblo" w="full">
          Submit Feedback
        </Button>
      </VStack>
    </form>
  );
}

// Comment Form Component
function CommentForm({ onSubmit }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ content });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Comment</FormLabel>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
          />
        </FormControl>

        <Button type="submit" colorScheme="pueblo" w="full">
          Add Comment
        </Button>
      </VStack>
    </form>
  );
} 