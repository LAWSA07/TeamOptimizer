// frontend/src/pages/Optimize.js
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, VStack, HStack, Card, CardBody, CardHeader, Button, Text, Badge,
  Select, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Progress, List, ListItem,
  ListIcon, useToast, Alert, AlertIcon, Grid, GridItem, Icon, Flex, Divider, Tabs, TabList, TabPanels, Tab, TabPanel,
  Spinner, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react';
import API_URL from '../config';
import { 
  FiZap, FiUsers, FiTarget, FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiActivity,
  FiBarChart, FiStar, FiArrowRight, FiMessageSquare, FiThumbsUp, FiClock, FiAward,
  FiSettings, FiPlay, FiPause, FiRefreshCw
} from 'react-icons/fi';

export default function Optimize() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState({
    enable_workload_balancing: true,
    enable_chemistry_scoring: true,
    workload_weights: { skill_match: 0.4, diversity: 0.3, workload: 0.3 },
    chemistry_weights: { communication: 0.4, collaboration: 0.3, conflict_risk: 0.3 }
  });
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, employeesRes] = await Promise.all([
        fetch(`${API_URL}/projects/`),
        fetch(`${API_URL}/employees/`)
      ]);
      
      const projectsData = await projectsRes.json();
      const employeesData = await employeesRes.json();
      
      setProjects(projectsData);
      setEmployees(employeesData);
      
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load projects and employees",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOptimize = async () => {
    if (!selectedProject) {
      toast({
        title: "Warning",
        description: "Please select a project first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/optimize/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: selectedProject,
          ...constraints
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setOptimizationResult(result);
        toast({
          title: "Success",
          description: "Team optimization completed successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Optimization failed');
      }
    } catch (error) {
      console.error('Error during optimization:', error);
      toast({
        title: "Error",
        description: "Failed to optimize team",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return FiTrendingUp;
    if (score >= 60) return FiActivity;
    return FiAlertTriangle;
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="2xl" color="gray.800" mb={2}>
            Team Optimization
          </Heading>
          <Text color="gray.600" fontSize="lg">
            AI-powered team formation with advanced constraints and analytics
          </Text>
        </Box>

        {/* Project Selection & Controls */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <VStack align="flex-start" spacing={1}>
                  <Text fontWeight="semibold" color="gray.700">Select Project</Text>
                  <Text fontSize="sm" color="gray.500">
                    Choose a project to optimize team formation
                  </Text>
                </VStack>
                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  maxW="300px"
                  bg="white"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </HStack>

              {selectedProjectData && (
                <Card bg="blue.50" border="1px solid" borderColor="blue.200">
                  <CardBody>
                    <HStack justify="space-between" align="center">
                      <VStack align="flex-start" spacing={1}>
                        <Text fontWeight="semibold" color="blue.800">
                          {selectedProjectData.name}
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          {selectedProjectData.description}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue" variant="subtle">
                            {selectedProjectData.required_roles?.length || 0} roles
                          </Badge>
                          <Badge colorScheme="green" variant="subtle">
                            {employees.length} available employees
                          </Badge>
                        </HStack>
                      </VStack>
                      <Button
                        leftIcon={<Icon as={FiPlay} />}
                        colorScheme="pueblo"
                        size="lg"
                        onClick={handleOptimize}
                        isLoading={loading}
                        loadingText="Optimizing..."
                        _hover={{
                          transform: "translateY(-1px)",
                          boxShadow: "lg"
                        }}
                        transition="all 0.2s"
                      >
                        Start Optimization
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Optimization Settings */}
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FiSettings} color="pueblo.500" boxSize={6} />
              <Heading size="md" color="gray.800">Optimization Settings</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Text fontWeight="semibold" color="gray.700" mb={3}>Workload Balancing</Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Skill Match Weight</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                      {constraints.workload_weights.skill_match * 100}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={constraints.workload_weights.skill_match * 100} 
                    colorScheme="blue" 
                    borderRadius="full"
                  />
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Diversity Weight</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="green.600">
                      {constraints.workload_weights.diversity * 100}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={constraints.workload_weights.diversity * 100} 
                    colorScheme="green" 
                    borderRadius="full"
                  />
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Workload Balance Weight</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="purple.600">
                      {constraints.workload_weights.workload * 100}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={constraints.workload_weights.workload * 100} 
                    colorScheme="purple" 
                    borderRadius="full"
                  />
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="gray.700" mb={3}>Team Chemistry</Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Communication</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                      {constraints.chemistry_weights.communication * 100}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={constraints.chemistry_weights.communication * 100} 
                    colorScheme="blue" 
                    borderRadius="full"
                  />
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Collaboration</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="green.600">
                      {constraints.chemistry_weights.collaboration * 100}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={constraints.chemistry_weights.collaboration * 100} 
                    colorScheme="green" 
                    borderRadius="full"
                  />
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Conflict Risk</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="red.600">
                      {constraints.chemistry_weights.conflict_risk * 100}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={constraints.chemistry_weights.conflict_risk * 100} 
                    colorScheme="red" 
                    borderRadius="full"
                  />
                </VStack>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Optimization Results */}
        {optimizationResult && (
          <>
            {/* Overall Results */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiStar} color="pueblo.500" boxSize={6} />
                  <Heading size="md" color="gray.800">Optimization Results</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                      Overall Team Score
                    </StatLabel>
                    <StatNumber fontSize="3xl" color={getScoreColor(optimizationResult.overall_score * 100)} fontWeight="bold">
                      {(optimizationResult.overall_score * 100).toFixed(0)}%
                    </StatNumber>
                    <StatHelpText color={getScoreColor(optimizationResult.overall_score * 100) + ".500"} fontSize="sm">
                      <Icon as={getScoreIcon(optimizationResult.overall_score * 100)} />
                      Excellent Performance
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                      Workload Balance
                    </StatLabel>
                    <StatNumber fontSize="3xl" color={getScoreColor(optimizationResult.workload_metrics.balance_score * 100)} fontWeight="bold">
                      {(optimizationResult.workload_metrics.balance_score * 100).toFixed(0)}%
                    </StatNumber>
                    <StatHelpText color="green.500" fontSize="sm">
                      <Icon as={FiActivity} />
                      Well Balanced
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                      Team Chemistry
                    </StatLabel>
                    <StatNumber fontSize="3xl" color={getScoreColor(optimizationResult.chemistry_metrics.overall_chemistry * 100)} fontWeight="bold">
                      {(optimizationResult.chemistry_metrics.overall_chemistry * 100).toFixed(0)}%
                    </StatNumber>
                    <StatHelpText color="green.500" fontSize="sm">
                      <Icon as={FiUsers} />
                      High Chemistry
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                      Team Size
                    </StatLabel>
                    <StatNumber fontSize="3xl" color="pueblo.600" fontWeight="bold">
                      {optimizationResult.best_team.length}
                    </StatNumber>
                    <StatHelpText color="pueblo.500" fontSize="sm">
                      <Icon as={FiTarget} />
                      Optimal Size
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiUsers} color="pueblo.500" boxSize={6} />
                  <Heading size="md" color="gray.800">Optimized Team</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {optimizationResult.best_team.map((member, index) => (
                    <Card key={index} variant="outline" borderColor="gray.200">
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack>
                            <Box
                              bg="pueblo.100"
                              color="pueblo.700"
                              p={2}
                              borderRadius="full"
                              fontSize="sm"
                              fontWeight="bold"
                            >
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </Box>
                            <VStack align="flex-start" spacing={0}>
                              <Text fontWeight="semibold" color="gray.800">
                                {member.name}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {member.role}
                              </Text>
                            </VStack>
                          </HStack>

                          <Box>
                            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                              Skills
                            </Text>
                            <HStack spacing={1} flexWrap="wrap">
                              {member.skills?.slice(0, 3).map((skill, skillIndex) => (
                                <Badge key={skillIndex} colorScheme="green" variant="subtle" fontSize="xs">
                                  {skill}
                                </Badge>
                              ))}
                              {member.skills?.length > 3 && (
                                <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                                  +{member.skills.length - 3} more
                                </Badge>
                              )}
                            </HStack>
                          </Box>

                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">Match Score</Text>
                            <Badge colorScheme={getScoreColor(member.match_score * 100)} variant="subtle">
                              {(member.match_score * 100).toFixed(0)}%
                            </Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Detailed Metrics */}
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Workload Metrics */}
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={FiActivity} color="pueblo.500" boxSize={6} />
                    <Heading size="md" color="gray.800">Workload Analysis</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.600">Balance Score</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="green.600">
                          {(optimizationResult.workload_metrics.balance_score * 100).toFixed(0)}%
                        </Text>
                      </HStack>
                      <Progress 
                        value={optimizationResult.workload_metrics.balance_score * 100} 
                        colorScheme="green" 
                        borderRadius="full"
                      />
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                        Workload Distribution
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {optimizationResult.workload_metrics.overloaded_members?.length > 0 && (
                          <Box>
                            <Text fontSize="xs" color="red.600" fontWeight="medium">
                              Overloaded Members ({optimizationResult.workload_metrics.overloaded_members.length})
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {optimizationResult.workload_metrics.overloaded_members.join(', ')}
                            </Text>
                          </Box>
                        )}
                        {optimizationResult.workload_metrics.underutilized_members?.length > 0 && (
                          <Box>
                            <Text fontSize="xs" color="yellow.600" fontWeight="medium">
                              Underutilized Members ({optimizationResult.workload_metrics.underutilized_members.length})
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {optimizationResult.workload_metrics.underutilized_members.join(', ')}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Chemistry Metrics */}
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={FiUsers} color="pueblo.500" boxSize={6} />
                    <Heading size="md" color="gray.800">Team Chemistry</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.600">Overall Chemistry</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                          {(optimizationResult.chemistry_metrics.overall_chemistry * 100).toFixed(0)}%
                        </Text>
                      </HStack>
                      <Progress 
                        value={optimizationResult.chemistry_metrics.overall_chemistry * 100} 
                        colorScheme="blue" 
                        borderRadius="full"
                      />
                    </Box>

                    <SimpleGrid columns={2} spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.600">Communication</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="green.600">
                          {(optimizationResult.chemistry_metrics.communication * 100).toFixed(0)}%
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.600">Collaboration</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="green.600">
                          {(optimizationResult.chemistry_metrics.collaboration * 100).toFixed(0)}%
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.600">Conflict Risk</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="red.600">
                          {(optimizationResult.chemistry_metrics.conflict_risk * 100).toFixed(0)}%
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiAward} color="pueblo.500" boxSize={6} />
                  <Heading size="md" color="gray.800">Recommendations</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {optimizationResult.recommendations?.map((rec, index) => (
                    <HStack key={index} p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                      <Icon as={FiCheckCircle} color="blue.500" />
                      <Text fontSize="sm" color="blue.700">{rec}</Text>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Collaboration Actions */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiMessageSquare} color="pueblo.500" boxSize={6} />
                  <Heading size="md" color="gray.800">Collaboration Actions</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Button
                    as="a"
                    href={`/collaboration?project=${selectedProject}&action=feedback`}
                    leftIcon={<Icon as={FiMessageSquare} />}
                    colorScheme="blue"
                    variant="outline"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "md"
                    }}
                    transition="all 0.2s"
                  >
                    Provide Feedback
                  </Button>
                  <Button
                    as="a"
                    href={`/collaboration?project=${selectedProject}&action=approval`}
                    leftIcon={<Icon as={FiThumbsUp} />}
                    colorScheme="green"
                    variant="outline"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "md"
                    }}
                    transition="all 0.2s"
                  >
                    Request Approval
                  </Button>
                  <Button
                    as="a"
                    href={`/collaboration?project=${selectedProject}&action=comment`}
                    leftIcon={<Icon as={FiClock} />}
                    colorScheme="purple"
                    variant="outline"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "md"
                    }}
                    transition="all 0.2s"
                  >
                    Add Comment
                  </Button>
                </SimpleGrid>
              </CardBody>
            </Card>
          </>
        )}

        {loading && (
          <Card>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Spinner size="xl" color="pueblo.500" />
                <Text color="gray.600" fontSize="lg">
                  Optimizing your team...
                </Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Analyzing skills, workload balance, and team chemistry to create the perfect team
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
}