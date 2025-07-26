import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import {
  Box, Heading, VStack, HStack, Card, CardBody, CardHeader, Button, Text, Badge,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, SimpleGrid, Grid, GridItem,
  Icon, Flex, Divider, Progress, useToast
} from '@chakra-ui/react';
import { 
  FiUsers, FiFolder, FiTrendingUp, FiActivity, FiPlus, FiZap, 
  FiBarChart, FiMessageSquare, FiArrowRight 
} from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    projects: 0,
    optimizations: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [employeesRes, projectsRes, performanceRes] = await Promise.all([
        fetch(`${API_URL}/employees/`),
        fetch(`${API_URL}/projects/`),
        fetch(`${API_URL}/analytics/performance`)
      ]);

      const employees = await employeesRes.json();
      const projects = await projectsRes.json();
      const performance = await performanceRes.json();

      setStats({
        employees: employees.length || 0,
        projects: projects.length || 0,
        optimizations: performance.total_optimizations || 0,
        successRate: performance.optimization_success_rate || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add Employee',
      description: 'Add a new team member',
      icon: FiUsers,
      color: 'blue',
      href: '/employees'
    },
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: FiFolder,
      color: 'green',
      href: '/create-project'
    },
    {
      title: 'Optimize Team',
      description: 'Generate optimal team',
      icon: FiZap,
      color: 'pueblo',
      href: '/optimize'
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: FiBarChart,
      color: 'purple',
      href: '/analytics'
    }
  ];

  const recentActivities = [
    { action: 'Team optimization completed', project: 'MERN Stack Project', time: '2 hours ago' },
    { action: 'New employee added', project: 'Sarah Johnson', time: '4 hours ago' },
    { action: 'Project created', project: 'Mobile App Development', time: '1 day ago' },
    { action: 'Analytics report generated', project: 'Q4 Review', time: '2 days ago' }
  ];

  return (
    <Box>
      {/* Header */}
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="2xl" color="gray.800" mb={2}>
            Welcome to TeamOptimizer
          </Heading>
          <Text color="gray.600" fontSize="lg">
            AI-powered team formation and optimization platform
          </Text>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                  Total Employees
                </StatLabel>
                <StatNumber fontSize="3xl" color="blue.600" fontWeight="bold">
                  {loading ? '...' : stats.employees}
                </StatNumber>
                <StatHelpText color="green.500" fontSize="sm">
                  <StatArrow type="increase" />
                  12% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                  Active Projects
                </StatLabel>
                <StatNumber fontSize="3xl" color="green.600" fontWeight="bold">
                  {loading ? '...' : stats.projects}
                </StatNumber>
                <StatHelpText color="green.500" fontSize="sm">
                  <StatArrow type="increase" />
                  8% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                  Optimizations
                </StatLabel>
                <StatNumber fontSize="3xl" color="pueblo.600" fontWeight="bold">
                  {loading ? '...' : stats.optimizations}
                </StatNumber>
                <StatHelpText color="pueblo.500" fontSize="sm">
                  <StatArrow type="increase" />
                  15% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                  Success Rate
                </StatLabel>
                <StatNumber fontSize="3xl" color="purple.600" fontWeight="bold">
                  {loading ? '...' : `${stats.successRate}%`}
                </StatNumber>
                <StatHelpText color="purple.500" fontSize="sm">
                  <StatArrow type="increase" />
                  5% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <Heading size="md" color="gray.800">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  as="a"
                  href={action.href}
                  variant="outline"
                  size="lg"
                  height="auto"
                  p={6}
                  flexDirection="column"
                  gap={3}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                    borderColor: `${action.color}.500`,
                    color: `${action.color}.600`
                  }}
                  transition="all 0.2s"
                >
                  <Icon as={action.icon} boxSize={8} color={`${action.color}.500`} />
                  <VStack spacing={1}>
                    <Text fontWeight="semibold" fontSize="md">
                      {action.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      {action.description}
                    </Text>
                  </VStack>
                </Button>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Recent Activity & Performance */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          <Card>
            <CardHeader>
              <Heading size="md" color="gray.800">Recent Activity</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {recentActivities.map((activity, index) => (
                  <Box key={index}>
                    <HStack justify="space-between" align="flex-start">
                      <VStack align="flex-start" spacing={1}>
                        <Text fontWeight="medium" color="gray.800">
                          {activity.action}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {activity.project}
                        </Text>
                      </VStack>
                      <Text fontSize="xs" color="gray.500">
                        {activity.time}
                      </Text>
                    </HStack>
                    {index < recentActivities.length - 1 && <Divider mt={4} />}
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md" color="gray.800">Performance Overview</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">Team Efficiency</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="green.600">85%</Text>
                  </HStack>
                  <Progress value={85} colorScheme="green" borderRadius="full" />
                </Box>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">Skill Coverage</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="blue.600">72%</Text>
                  </HStack>
                  <Progress value={72} colorScheme="blue" borderRadius="full" />
                </Box>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">Diversity Score</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="purple.600">78%</Text>
                  </HStack>
                  <Progress value={78} colorScheme="purple" borderRadius="full" />
                </Box>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">Project Completion</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="pueblo.600">92%</Text>
                  </HStack>
                  <Progress value={92} colorScheme="pueblo" borderRadius="full" />
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Call to Action */}
        <Card bg="pueblo.50" border="1px solid" borderColor="pueblo.200">
          <CardBody>
            <HStack justify="space-between" align="center">
              <VStack align="flex-start" spacing={2}>
                <Heading size="md" color="pueblo.800">
                  Ready to optimize your team?
                </Heading>
                <Text color="pueblo.700">
                  Use our AI-powered optimization to create the perfect team for your next project.
                </Text>
              </VStack>
              <Button
                as="a"
                href="/optimize"
                colorScheme="pueblo"
                size="lg"
                rightIcon={<FiArrowRight />}
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
      </VStack>
    </Box>
  );
} 