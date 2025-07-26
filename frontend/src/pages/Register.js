import React, { useState } from 'react';
import {
  Box, Heading, VStack, HStack, Card, CardBody, CardHeader, Button, Text, Badge,
  FormControl, FormLabel, Input, InputGroup, InputRightElement, useToast, Icon,
  Divider, Alert, AlertIcon, Spinner, Checkbox, SimpleGrid
} from '@chakra-ui/react';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiUser, FiShield, FiArrowRight, 
  FiCheck, FiUsers, FiStar 
} from 'react-icons/fi';
import API_URL from '../config';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        toast({
          title: "Success",
          description: "Account created successfully! Welcome to TeamOptimizer.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FiUsers,
      color: "green.500",
      title: "Team Management",
      description: "Easily manage team members and their skills"
    },
    {
      icon: FiShield,
      color: "blue.500",
      title: "AI Optimization",
      description: "AI-powered team formation and optimization"
    },
    {
      icon: FiStar,
      color: "purple.500",
      title: "Advanced Analytics",
      description: "Comprehensive insights and performance metrics"
    }
  ];

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Box maxW="lg" mx="auto">
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Box
              bg="pueblo.500"
              color="white"
              p={4}
              borderRadius="full"
              fontSize="2xl"
              fontWeight="bold"
            >
              TO
            </Box>
            <VStack spacing={2}>
              <Heading size="2xl" color="gray.800">
                Join TeamOptimizer
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Create your account and start optimizing teams
              </Text>
            </VStack>
          </VStack>

          <HStack spacing={8} align="flex-start" w="full">
            {/* Registration Form */}
            <Card flex={1} shadow="xl">
              <CardHeader textAlign="center" pb={4}>
                <HStack justify="center" spacing={2}>
                  <Icon as={FiUserPlus} color="pueblo.500" boxSize={6} />
                  <Heading size="md" color="gray.800">Create Account</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={5}>
                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">
                        <HStack spacing={2}>
                          <Icon as={FiUser} color="pueblo.500" boxSize={4} />
                          <Text>Full Name</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        size="lg"
                        bg="white"
                        _focus={{
                          borderColor: "pueblo.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">
                        <HStack spacing={2}>
                          <Icon as={FiMail} color="pueblo.500" boxSize={4} />
                          <Text>Email Address</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        size="lg"
                        bg="white"
                        _focus={{
                          borderColor: "pueblo.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">
                        <HStack spacing={2}>
                          <Icon as={FiLock} color="pueblo.500" boxSize={4} />
                          <Text>Password</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup size="lg">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Create a strong password"
                          bg="white"
                          _focus={{
                            borderColor: "pueblo.500",
                            boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                          }}
                        />
                        <InputRightElement>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            _hover={{ bg: "transparent" }}
                          >
                            <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.500" />
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium">
                        <HStack spacing={2}>
                          <Icon as={FiLock} color="pueblo.500" boxSize={4} />
                          <Text>Confirm Password</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup size="lg">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm your password"
                          bg="white"
                          _focus={{
                            borderColor: "pueblo.500",
                            boxShadow: "0 0 0 1px var(--chakra-colors-pueblo-500)"
                          }}
                        />
                        <InputRightElement>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            _hover={{ bg: "transparent" }}
                          >
                            <Icon as={showConfirmPassword ? FiEyeOff : FiEye} color="gray.500" />
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <Checkbox
                        isChecked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        colorScheme="pueblo"
                        size="lg"
                      >
                        <Text fontSize="sm" color="gray.600">
                          I agree to the{' '}
                          <Text as="span" color="pueblo.500" fontWeight="medium">
                            Terms of Service
                          </Text>{' '}
                          and{' '}
                          <Text as="span" color="pueblo.500" fontWeight="medium">
                            Privacy Policy
                          </Text>
                        </Text>
                      </Checkbox>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="pueblo"
                      size="lg"
                      w="full"
                      isLoading={loading}
                      loadingText="Creating account..."
                      rightIcon={<Icon as={FiArrowRight} />}
                      _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "lg"
                      }}
                      transition="all 0.2s"
                    >
                      Create Account
                    </Button>
                  </VStack>
                </form>

                <Divider my={6} />

                {/* Sign In Link */}
                <VStack spacing={3}>
                  <Text fontSize="sm" color="gray.600">
                    Already have an account?
                  </Text>
                  <Button
                    as="a"
                    href="/login"
                    variant="outline"
                    colorScheme="pueblo"
                    size="md"
                    w="full"
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "md"
                    }}
                    transition="all 0.2s"
                  >
                    Sign In
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Features */}
            <Card flex={1} shadow="xl" display={{ base: "none", lg: "block" }}>
              <CardHeader>
                <Heading size="md" color="gray.800">Why Choose TeamOptimizer?</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  {features.map((feature, index) => (
                    <HStack key={index} spacing={4} align="flex-start">
                      <Box
                        bg={`${feature.color.replace('.500', '.100')}`}
                        color={feature.color}
                        p={2}
                        borderRadius="lg"
                      >
                        <Icon as={feature.icon} boxSize={5} />
                      </Box>
                      <VStack align="flex-start" spacing={1}>
                        <Text fontWeight="semibold" color="gray.800">
                          {feature.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {feature.description}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>

                <Divider my={6} />

                {/* Stats */}
                <VStack spacing={4}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Trusted by teams worldwide
                  </Text>
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="pueblo.600">
                        500+
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Teams Optimized
                      </Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="pueblo.600">
                        95%
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Success Rate
                      </Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </HStack>

          {/* Footer */}
          <VStack spacing={2}>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              © 2024 TeamOptimizer. All rights reserved.
            </Text>
            <HStack spacing={4}>
              <Text fontSize="xs" color="gray.500">Privacy Policy</Text>
              <Text fontSize="xs" color="gray.500">Terms of Service</Text>
              <Text fontSize="xs" color="gray.500">Support</Text>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
} 