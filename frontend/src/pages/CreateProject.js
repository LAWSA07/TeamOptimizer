import React, { useState } from 'react';
import {
  Box, Heading, VStack, HStack, Card, CardBody, CardHeader, Button, Text, Badge,
  FormControl, FormLabel, Input, Textarea, Select, useToast, Icon, Divider,
  SimpleGrid, Alert, AlertIcon, Spinner
} from '@chakra-ui/react';
import { 
  FiFolder, FiPlus, FiUsers, FiTarget, FiCalendar, FiMapPin, FiArrowRight,
  FiCheck, FiSettings, FiStar 
} from 'react-icons/fi';
import API_URL from '../config';

export default function CreateProject() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    required_roles: [],
    timeline: '',
    budget: '',
    priority: 'medium',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Project created successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Reset form
        setFormData({
          name: '',
          description: '',
          required_roles: [],
          timeline: '',
          budget: '',
          priority: 'medium',
          department: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const addRole = () => {
    setFormData(prev => ({
      ...prev,
      required_roles: [...prev.required_roles, { role: '', skills: [], experience_level: 'mid' }]
    }));
  };

  const updateRole = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      required_roles: prev.required_roles.map((role, i) => 
        i === index ? { ...role, [field]: value } : role
      )
    }));
  };

  const removeRole = (index) => {
    setFormData(prev => ({
      ...prev,
      required_roles: prev.required_roles.filter((_, i) => i !== index)
    }));
  };

  const addSkill = (roleIndex) => {
    setFormData(prev => ({
      ...prev,
      required_roles: prev.required_roles.map((role, i) => 
        i === roleIndex 
          ? { ...role, skills: [...role.skills, ''] }
          : role
      )
    }));
  };

  const updateSkill = (roleIndex, skillIndex, value) => {
    setFormData(prev => ({
      ...prev,
      required_roles: prev.required_roles.map((role, i) => 
        i === roleIndex 
          ? { 
              ...role, 
              skills: role.skills.map((skill, j) => j === skillIndex ? value : skill)
            }
          : role
      )
    }));
  };

  const removeSkill = (roleIndex, skillIndex) => {
    setFormData(prev => ({
      ...prev,
      required_roles: prev.required_roles.map((role, i) => 
        i === roleIndex 
          ? { ...role, skills: role.skills.filter((_, j) => j !== skillIndex) }
          : role
      )
    }));
  };

  const projectTypes = [
    {
      icon: FiUsers,
      color: "blue.500",
      title: "Team Project",
      description: "Collaborative project requiring multiple team members"
    },
    {
      icon: FiTarget,
      color: "green.500",
      title: "Strategic Initiative",
      description: "High-impact project with clear objectives"
    },
    {
      icon: FiSettings,
      color: "purple.500",
      title: "Technical Implementation",
      description: "Development or technical implementation project"
    }
  ];

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="2xl" color="gray.800" mb={2}>
            Create New Project
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Define your project requirements and team needs
          </Text>
        </Box>

        <HStack spacing={8} align="flex-start">
          {/* Project Form */}
          <Card flex={2} shadow="xl">
            <CardHeader>
              <HStack>
                <Icon as={FiFolder} color="pueblo.500" boxSize={6} />
                <Heading size="md" color="gray.800">Project Details</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  {/* Basic Information */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">Project Name</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter project name"
                        bg="white"
                        _focus={{
                          borderColor: "pueblo.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">Department</FormLabel>
                      <Select
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="Select department"
                        bg="white"
                        _focus={{
                          borderColor: "pueblo.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                        }}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium">Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your project goals, objectives, and requirements..."
                      rows={4}
                      bg="white"
                      _focus={{
                        borderColor: "pueblo.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                      }}
                    />
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                    <FormControl>
                      <FormLabel color="gray.700" fontWeight="medium">Timeline</FormLabel>
                      <Input
                        value={formData.timeline}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                        placeholder="e.g., 3 months"
                        bg="white"
                        _focus={{
                          borderColor: "pueblo.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700" fontWeight="medium">Budget</FormLabel>
                      <Input
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder="e.g., $50,000"
                        bg="white"
                        _focus={{
                          borderColor: "pueblo.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700" fontWeight="medium">Priority</FormLabel>
                      <Select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        bg="white"
                        _focus={{
                          borderColor: "pueblo.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                        }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  {/* Required Roles */}
                  <Box w="full">
                    <HStack justify="space-between" mb={4}>
                      <Text fontWeight="semibold" color="gray.700">Required Roles</Text>
                      <Button
                        leftIcon={<Icon as={FiPlus} />}
                        size="sm"
                        variant="outline"
                        colorScheme="pueblo"
                        onClick={addRole}
                      >
                        Add Role
                      </Button>
                    </HStack>

                    <VStack spacing={4} align="stretch">
                      {formData.required_roles.map((role, roleIndex) => (
                        <Card key={roleIndex} variant="outline" borderColor="gray.200">
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              <HStack justify="space-between">
                                <Text fontWeight="medium" color="gray.700">
                                  Role {roleIndex + 1}
                                </Text>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => removeRole(roleIndex)}
                                >
                                  Remove
                                </Button>
                              </HStack>

                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <FormControl isRequired>
                                  <FormLabel fontSize="sm" color="gray.600">Role Title</FormLabel>
                                  <Input
                                    value={role.role}
                                    onChange={(e) => updateRole(roleIndex, 'role', e.target.value)}
                                    placeholder="e.g., Frontend Developer"
                                    size="sm"
                                    bg="white"
                                  />
                                </FormControl>

                                <FormControl>
                                  <FormLabel fontSize="sm" color="gray.600">Experience Level</FormLabel>
                                  <Select
                                    value={role.experience_level}
                                    onChange={(e) => updateRole(roleIndex, 'experience_level', e.target.value)}
                                    size="sm"
                                    bg="white"
                                  >
                                    <option value="junior">Junior</option>
                                    <option value="mid">Mid-level</option>
                                    <option value="senior">Senior</option>
                                    <option value="lead">Lead</option>
                                  </Select>
                                </FormControl>
                              </SimpleGrid>

                              <Box>
                                <HStack justify="space-between" mb={2}>
                                  <FormLabel fontSize="sm" color="gray.600" mb={0}>
                                    Required Skills
                                  </FormLabel>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => addSkill(roleIndex)}
                                  >
                                    Add Skill
                                  </Button>
                                </HStack>
                                <VStack spacing={2} align="stretch">
                                  {role.skills.map((skill, skillIndex) => (
                                    <HStack key={skillIndex}>
                                      <Input
                                        value={skill}
                                        onChange={(e) => updateSkill(roleIndex, skillIndex, e.target.value)}
                                        placeholder="e.g., React, TypeScript"
                                        size="sm"
                                        bg="white"
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={() => removeSkill(roleIndex, skillIndex)}
                                      >
                                        Remove
                                      </Button>
                                    </HStack>
                                  ))}
                                </VStack>
                              </Box>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </Box>

                  <Button
                    type="submit"
                    colorScheme="pueblo"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="Creating project..."
                    rightIcon={<Icon as={FiArrowRight} />}
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "lg"
                    }}
                    transition="all 0.2s"
                  >
                    Create Project
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Project Types & Tips */}
          <Card flex={1} shadow="xl" display={{ base: "none", lg: "block" }}>
            <CardHeader>
              <Heading size="md" color="gray.800">Project Types</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {projectTypes.map((type, index) => (
                  <HStack key={index} spacing={4} align="flex-start">
                    <Box
                      bg={`${type.color.replace('.500', '.100')}`}
                      color={type.color}
                      p={2}
                      borderRadius="lg"
                    >
                      <Icon as={type.icon} boxSize={5} />
                    </Box>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontWeight="semibold" color="gray.800">
                        {type.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {type.description}
                      </Text>
                    </VStack>
                  </HStack>
                ))}

                <Divider />

                <Box>
                  <Text fontWeight="semibold" color="gray.700" mb={3}>
                    Tips for Better Optimization
                  </Text>
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3}>
                      <Icon as={FiCheck} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        Be specific about required skills and experience levels
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiCheck} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        Include clear project objectives and timeline
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiCheck} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        Consider team size and workload distribution
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiCheck} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        Define priority and budget constraints clearly
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="semibold" color="gray.700" mb={3}>
                    Next Steps
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack spacing={3}>
                      <Icon as={FiStar} color="pueblo.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        Review and refine project requirements
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiStar} color="pueblo.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        Run team optimization analysis
                      </Text>
                    </HStack>
                    <HStack spacing={3}>
                      <Icon as={FiStar} color="pueblo.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">
                        Review analytics and recommendations
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </HStack>
      </VStack>
    </Box>
  );
} 