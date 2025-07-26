import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box, Flex, Heading, Button, Container, useColorModeValue, Icon } from '@chakra-ui/react';
import { 
  FiHome, FiUsers, FiBarChart, FiMessageSquare, FiLogIn, FiUserPlus, 
  FiPlus, FiZap, FiMenu, FiX 
} from 'react-icons/fi';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateProject from './pages/CreateProject';
import Optimize from './pages/optimize';
import Analytics from './pages/Analytics';
import Collaboration from './pages/Collaboration';
import theme from './theme';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'Employees', path: '/employees', icon: FiUsers },
    { name: 'Analytics', path: '/analytics', icon: FiBarChart },
    { name: 'Collaboration', path: '/collaboration', icon: FiMessageSquare },
    { name: 'Create Project', path: '/create-project', icon: FiPlus },
    { name: 'Optimize', path: '/optimize', icon: FiZap },
  ];

  const authItems = [
    { name: 'Login', path: '/login', icon: FiLogIn },
    { name: 'Register', path: '/register', icon: FiUserPlus },
  ];

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" bg="gray.50">
          {/* Navigation */}
          <Box 
            as="nav" 
            borderBottom="1px solid" 
            borderColor={borderColor}
            position="sticky"
            top={0}
            zIndex={10}
            backdropFilter="blur(10px)"
            bg="rgba(255, 255, 255, 0.95)"
          >
            <Container maxW="7xl">
              <Flex align="center" justify="space-between" py={4}>
                {/* Logo */}
                <Flex align="center" gap={3}>
                  <Box 
                    bg="pueblo.500" 
                    color="white" 
                    p={2} 
                    borderRadius="lg"
                    fontSize="xl"
                    fontWeight="bold"
                  >
                    TO
                  </Box>
                  <Heading size="lg" color="pueblo.700" display={{ base: 'none', md: 'block' }}>
                    TeamOptimizer
                  </Heading>
                </Flex>

                {/* Desktop Navigation */}
                <Flex gap={2} display={{ base: 'none', md: 'flex' }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      as="a"
                      href={item.path}
                      variant="ghost"
                      size="md"
                      leftIcon={<Icon as={item.icon} />}
                      color="gray.700"
                      _hover={{ 
                        bg: "pueblo.50", 
                        color: "pueblo.700",
                        transform: "translateY(-1px)",
                        boxShadow: "md"
                      }}
                      transition="all 0.2s"
                    >
                      {item.name}
                    </Button>
                  ))}
                </Flex>

                {/* Auth Buttons */}
                <Flex gap={2} display={{ base: 'none', md: 'flex' }}>
                  {authItems.map((item) => (
                    <Button
                      key={item.path}
                      as="a"
                      href={item.path}
                      variant={item.name === 'Login' ? 'outline' : 'solid'}
                      size="md"
                      leftIcon={<Icon as={item.icon} />}
                      _hover={{ 
                        transform: "translateY(-1px)",
                        boxShadow: "md"
                      }}
                      transition="all 0.2s"
                    >
                      {item.name}
                    </Button>
                  ))}
                </Flex>

                {/* Mobile Menu Button */}
                <Button
                  display={{ base: 'flex', md: 'none' }}
                  variant="ghost"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  p={2}
                >
                  <Icon as={isMobileMenuOpen ? FiX : FiMenu} boxSize={5} />
                </Button>
              </Flex>

              {/* Mobile Navigation */}
              {isMobileMenuOpen && (
                <Box 
                  display={{ base: 'block', md: 'none' }} 
                  py={4}
                  borderTop="1px solid"
                  borderColor={borderColor}
                >
                  <Flex direction="column" gap={2}>
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        as="a"
                        href={item.path}
                        variant="ghost"
                        justifyContent="flex-start"
                        leftIcon={<Icon as={item.icon} />}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Button>
                    ))}
                    <Box borderTop="1px solid" borderColor={borderColor} pt={2} mt={2}>
                      {authItems.map((item) => (
                        <Button
                          key={item.path}
                          as="a"
                          href={item.path}
                          variant={item.name === 'Login' ? 'outline' : 'solid'}
                          justifyContent="flex-start"
                          leftIcon={<Icon as={item.icon} />}
                          w="full"
                          mb={2}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Button>
                      ))}
                    </Box>
                  </Flex>
                </Box>
              )}
            </Container>
          </Box>

          {/* Main Content */}
          <Container maxW="7xl" py={8}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/collaboration" element={<Collaboration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-project" element={<CreateProject />} />
              <Route path="/optimize" element={<Optimize />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 