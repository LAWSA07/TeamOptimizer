import React, { useState } from 'react';
import {
  Box, Heading, VStack, HStack, Card, CardBody, CardHeader, Button, Text, Badge,
  FormControl, FormLabel, Input, InputGroup, InputRightElement, useToast, Icon,
  Divider, Alert, AlertIcon, Spinner
} from '@chakra-ui/react';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUser, FiShield, FiArrowRight, FiUsers 
} from 'react-icons/fi';
import API_URL from '../config';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        toast({
          title: "Success",
          description: "Login successful! Welcome back.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to login. Please check your credentials.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Box maxW="md" mx="auto">
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
                Welcome Back
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Sign in to your TeamOptimizer account
              </Text>
            </VStack>
          </VStack>

          {/* Login Form */}
          <Card w="full" shadow="xl">
            <CardHeader textAlign="center" pb={4}>
              <HStack justify="center" spacing={2}>
                <Icon as={FiLogIn} color="pueblo.500" boxSize={6} />
                <Heading size="md" color="gray.800">Sign In</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
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
                        placeholder="Enter your password"
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

                  <Button
                    type="submit"
                    colorScheme="pueblo"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="Signing in..."
                    rightIcon={<Icon as={FiArrowRight} />}
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "lg"
                    }}
                    transition="all 0.2s"
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>

              <Divider my={6} />

              {/* Features */}
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600" textAlign="center" fontWeight="medium">
                  What you can do with TeamOptimizer:
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack spacing={3}>
                    <Icon as={FiUsers} color="green.500" boxSize={4} />
                    <Text fontSize="sm" color="gray.600">Manage team members and skills</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={FiShield} color="blue.500" boxSize={4} />
                    <Text fontSize="sm" color="gray.600">AI-powered team optimization</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={FiUser} color="purple.500" boxSize={4} />
                    <Text fontSize="sm" color="gray.600">Advanced analytics and insights</Text>
                  </HStack>
                </VStack>
              </VStack>

              <Divider my={6} />

              {/* Sign Up Link */}
              <VStack spacing={3}>
                <Text fontSize="sm" color="gray.600">
                  Don't have an account?
                </Text>
                <Button
                  as="a"
                  href="/register"
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
                  Create Account
                </Button>
              </VStack>
            </CardBody>
          </Card>

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