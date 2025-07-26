import React, { useState, useEffect } from 'react';
import {
  Box, Heading, VStack, HStack, Card, CardBody, CardHeader, Button, Text, Badge,
  Select, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Progress, List, ListItem,
  ListIcon, useToast, Alert, AlertIcon, Grid, GridItem, Icon, Flex, Divider, Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import API_URL from '../config';
import { 
  FiTrendingUp, FiTrendingDown, FiUsers, FiTarget, FiCheckCircle, FiAlertTriangle,
  FiBarChart, FiPieChart, FiActivity, FiAward, FiStar, FiArrowUp, FiArrowDown
} from 'react-icons/fi';

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchAnalytics();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects/`);
      const data = await response.json();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const [analyticsRes, skillGapsRes, performanceRes] = await Promise.all([
        fetch(`${API_URL}/analytics/summary/${selectedProject}`),
        fetch(`${API_URL}/analytics/skill-gaps/${selectedProject}`),
        fetch(`${API_URL}/analytics/performance`)
      ]);

      const analyticsData = await analyticsRes.json();
      const skillGapsData = await skillGapsRes.json();
      const performanceData = await performanceRes.json();

      setAnalytics(analyticsData);
      setSkillGaps(skillGapsData);
      setPerformance(performanceData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
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
    return FiTrendingDown;
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="2xl" color="gray.800" mb={2}>
            Analytics Dashboard
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Comprehensive insights into team performance and optimization metrics
          </Text>
        </Box>

        {/* Project Selection */}
        <Card>
          <CardBody>
            <HStack justify="space-between" align="center">
              <VStack align="flex-start" spacing={1}>
                <Text fontWeight="semibold" color="gray.700">Select Project</Text>
                <Text fontSize="sm" color="gray.500">
                  Choose a project to view detailed analytics
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
          </CardBody>
        </Card>

        {loading && (
          <Alert status="info">
            <AlertIcon />
            Loading analytics data...
          </Alert>
        )}

        {analytics && !loading && (
          <>
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiBarChart} color="pueblo.500" boxSize={6} />
                  <Heading size="md" color="gray.800">Performance Metrics</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                      Optimization Success Rate
                    </StatLabel>
                    <StatNumber fontSize="2xl" color={getScoreColor(performance?.optimization_success_rate)} fontWeight="bold">
                      {performance?.optimization_success_rate || 0}%
                    </StatNumber>
                    <StatHelpText color={performance?.optimization_success_rate >= 80 ? "green.500" : "red.500"} fontSize="sm">
                      <Icon as={getScoreIcon(performance?.optimization_success_rate)} />
                      {performance?.optimization_success_rate >= 80 ? "Excellent" : "Needs Improvement"}
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                      Average Team Score
                    </StatLabel>
                    <StatNumber fontSize="2xl" color={getScoreColor(performance?.average_team_score * 100)} fontWeight="bold">
                      {(performance?.average_team_score * 100 || 0).toFixed(0)}%
                    </StatNumber>
                    <StatHelpText color="green.500" fontSize="sm">
                      <Icon as={FiTrendingUp} />
                      Excellent
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                      Constraint Satisfaction
                    </StatLabel>
                    <StatNumber fontSize="2xl" color={getScoreColor(performance?.constraint_satisfaction_rate * 100)} fontWeight="bold">
                      {(performance?.constraint_satisfaction_rate * 100 || 0).toFixed(0)}%
                    </StatNumber>
                    <StatHelpText color="green.500" fontSize="sm">
                      <Icon as={FiCheckCircle} />
                      Excellent
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                      Diversity Score
                    </StatLabel>
                    <StatNumber fontSize="2xl" color={getScoreColor(performance?.diversity_score * 100)} fontWeight="bold">
                      {(performance?.diversity_score * 100 || 0).toFixed(0)}%
                    </StatNumber>
                    <StatHelpText color="yellow.500" fontSize="sm">
                      <Icon as={FiActivity} />
                      Good
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Team Analytics */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiUsers} color="pueblo.500" boxSize={6} />
                  <Heading size="md" color="gray.800">Team Analytics</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  {/* Overall Score */}
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="semibold" color="gray.700">Overall Team Score</Text>
                      <Badge colorScheme={getScoreColor(analytics.team_analytics.overall_score * 100)} fontSize="sm">
                        {(analytics.team_analytics.overall_score * 100).toFixed(0)}%
                      </Badge>
                    </HStack>
                    <Progress 
                      value={analytics.team_analytics.overall_score * 100} 
                      colorScheme={getScoreColor(analytics.team_analytics.overall_score * 100)}
                      borderRadius="full"
                      size="lg"
                    />
                  </Box>

                  {/* Skill Coverage */}
                  <Box>
                    <Text fontWeight="semibold" color="gray.700" mb={4}>Skill Coverage</Text>
                    <VStack spacing={3} align="stretch">
                      {analytics.team_analytics.skill_coverage.map((skill, index) => (
                        <Box key={index}>
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="sm" fontWeight="medium" color="gray.600">
                              {skill.skill}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {skill.employees_with_skill} of {skill.total_employees} employees
                            </Text>
                          </HStack>
                          <Progress 
                            value={skill.coverage_percentage} 
                            colorScheme={getScoreColor(skill.coverage_percentage)}
                            borderRadius="full"
                          />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {skill.coverage_percentage.toFixed(0)}% coverage
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  {/* Diversity Metrics */}
                  <Box>
                    <Text fontWeight="semibold" color="gray.700" mb={4}>Diversity Metrics</Text>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>Gender Distribution</Text>
                        <VStack spacing={2} align="stretch">
                          {Object.entries(analytics.team_analytics.diversity_metrics.gender_distribution).map(([gender, count]) => (
                            <HStack key={gender} justify="space-between">
                              <Text fontSize="sm" textTransform="capitalize">{gender}</Text>
                              <Badge colorScheme="blue" variant="subtle">{count}</Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>

                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>Seniority Distribution</Text>
                        <VStack spacing={2} align="stretch">
                          {Object.entries(analytics.team_analytics.diversity_metrics.seniority_distribution).map(([level, count]) => (
                            <HStack key={level} justify="space-between">
                              <Text fontSize="sm" textTransform="capitalize">{level}</Text>
                              <Badge colorScheme="green" variant="subtle">{count}</Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>

                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>Department Distribution</Text>
                        <VStack spacing={2} align="stretch">
                          {Object.entries(analytics.team_analytics.diversity_metrics.department_distribution).map(([dept, count]) => (
                            <HStack key={dept} justify="space-between">
                              <Text fontSize="sm">{dept}</Text>
                              <Badge colorScheme="purple" variant="subtle">{count}</Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Skill Gap Analysis */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiTarget} color="pueblo.500" boxSize={6} />
                  <Heading size="md" color="gray.800">Skill Gap Analysis</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <Box>
                    <Text fontWeight="semibold" color="gray.700" mb={3}>Critical Gaps</Text>
                    {skillGaps.critical_gaps.length > 0 ? (
                      <VStack spacing={2} align="stretch">
                        {skillGaps.critical_gaps.map((skill, index) => (
                          <HStack key={index} p={3} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                            <Icon as={FiAlertTriangle} color="red.500" />
                            <Text fontSize="sm" fontWeight="medium" color="red.700">{skill}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="green.600">No critical skill gaps identified</Text>
                    )}
                  </Box>

                  <Box>
                    <Text fontWeight="semibold" color="gray.700" mb={3}>Recommendations</Text>
                    <VStack spacing={3} align="stretch">
                      {skillGaps.hiring_recommendations.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                            Hiring Recommendations:
                          </Text>
                          <List spacing={1}>
                            {skillGaps.hiring_recommendations.map((rec, index) => (
                              <ListItem key={index} fontSize="sm" color="gray.700">
                                <ListIcon as={FiUsers} color="blue.500" />
                                {rec}
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {skillGaps.training_recommendations.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                            Training Recommendations:
                          </Text>
                          <List spacing={1}>
                            {skillGaps.training_recommendations.map((rec, index) => (
                              <ListItem key={index} fontSize="sm" color="gray.700">
                                <ListIcon as={FiAward} color="green.500" />
                                {rec}
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                </Grid>
              </CardBody>
            </Card>

            {/* Team Recommendations */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiStar} color="pueblo.500" boxSize={6} />
                  <Heading size="md" color="gray.800">Team Recommendations</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {analytics.team_analytics.recommendations.map((rec, index) => (
                    <HStack key={index} p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                      <Icon as={FiCheckCircle} color="blue.500" />
                      <Text fontSize="sm" color="blue.700">{rec}</Text>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Box>
  );
} 