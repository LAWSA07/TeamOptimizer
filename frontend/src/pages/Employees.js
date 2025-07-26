import React, { useState, useEffect } from 'react';
import {
  Box, Heading, VStack, HStack, Card, CardBody, CardHeader, Button, Text, Badge,
  Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Select,
  useDisclosure, useToast, Icon, Flex, SimpleGrid, Stat, StatLabel, StatNumber,
  StatHelpText, Alert, AlertIcon, Spinner, Divider
} from '@chakra-ui/react';
import { 
  FiUsers, FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiUser, FiMail, 
  FiBriefcase, FiMapPin, FiStar, FiTrendingUp 
} from 'react-icons/fi';
import API_URL from '../config';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees/`);
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (employeeData) => {
    try {
      const url = editingEmployee 
        ? `${API_URL}/employees/${editingEmployee.id}`
        : `${API_URL}/employees/`;
      
      const method = editingEmployee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingEmployee ? "Employee updated successfully" : "Employee added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchEmployees();
        onClose();
        setEditingEmployee(null);
      } else {
        throw new Error('Failed to save employee');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: "Failed to save employee",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`${API_URL}/employees/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Employee deleted successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          fetchEmployees();
        } else {
          throw new Error('Failed to delete employee');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        toast({
          title: "Error",
          description: "Failed to delete employee",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    onOpen();
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    onOpen();
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status !== 'inactive').length;
  const departmentsCount = departments.length;

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="2xl" color="gray.800" mb={2}>
            Employee Management
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Manage your team members and their skills
          </Text>
        </Box>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                  Total Employees
                </StatLabel>
                <StatNumber fontSize="3xl" color="blue.600" fontWeight="bold">
                  {totalEmployees}
                </StatNumber>
                <StatHelpText color="green.500" fontSize="sm">
                  <Icon as={FiTrendingUp} />
                  12% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                  Active Employees
                </StatLabel>
                <StatNumber fontSize="3xl" color="green.600" fontWeight="bold">
                  {activeEmployees}
                </StatNumber>
                <StatHelpText color="green.500" fontSize="sm">
                  <Icon as={FiUsers} />
                  {((activeEmployees / totalEmployees) * 100).toFixed(0)}% active rate
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                  Departments
                </StatLabel>
                <StatNumber fontSize="3xl" color="pueblo.600" fontWeight="bold">
                  {departmentsCount}
                </StatNumber>
                <StatHelpText color="pueblo.500" fontSize="sm">
                  <Icon as={FiBriefcase} />
                  Across organization
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Controls */}
        <Card>
          <CardBody>
            <HStack justify="space-between" align="center">
              <HStack spacing={4} flex={1}>
                <Box position="relative" flex={1} maxW="400px">
                  <Icon as={FiSearch} position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    pl={10}
                    bg="white"
                  />
                </Box>
                <Select
                  placeholder="All Departments"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  maxW="200px"
                  bg="white"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
              </HStack>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="pueblo"
                onClick={openAddModal}
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "lg"
                }}
                transition="all 0.2s"
              >
                Add Employee
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Employee Table */}
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FiUsers} color="pueblo.500" boxSize={6} />
              <Heading size="md" color="gray.800">Employee List</Heading>
              <Badge colorScheme="blue" variant="subtle">
                {filteredEmployees.length} employees
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="pueblo.500" />
                <Text mt={4} color="gray.600">Loading employees...</Text>
              </Box>
            ) : filteredEmployees.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No employees found matching your criteria
              </Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Department</Th>
                      <Th>Skills</Th>
                      <Th>Gender</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredEmployees.map((employee) => (
                      <Tr key={employee.id} _hover={{ bg: "gray.50" }}>
                        <Td>
                          <HStack>
                            <Box
                              bg="pueblo.100"
                              color="pueblo.700"
                              p={2}
                              borderRadius="full"
                              fontSize="sm"
                              fontWeight="bold"
                            >
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </Box>
                            <VStack align="flex-start" spacing={0}>
                              <Text fontWeight="semibold" color="gray.800">
                                {employee.name}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                ID: {employee.id}
                              </Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack>
                            <Icon as={FiMail} color="gray.400" boxSize={4} />
                            <Text fontSize="sm">{employee.email}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack>
                            <Icon as={FiBriefcase} color="gray.400" boxSize={4} />
                            <Badge colorScheme="blue" variant="subtle">
                              {employee.department}
                            </Badge>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={1} flexWrap="wrap">
                            {employee.skills?.slice(0, 3).map((skill, index) => (
                              <Badge key={index} colorScheme="green" variant="subtle" fontSize="xs">
                                {skill.name}
                              </Badge>
                            ))}
                            {employee.skills?.length > 3 && (
                              <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                                +{employee.skills.length - 3} more
                              </Badge>
                            )}
                          </HStack>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={employee.gender === 'female' ? 'pink' : 'blue'} 
                            variant="subtle"
                          >
                            {employee.gender || 'Not specified'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={employee.status === 'active' ? 'green' : 'red'} 
                            variant="subtle"
                          >
                            {employee.status || 'active'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => openEditModal(employee)}
                              leftIcon={<Icon as={FiEdit} />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDelete(employee.id)}
                              leftIcon={<Icon as={FiTrash2} />}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Add/Edit Modal */}
      <EmployeeForm
        isOpen={isOpen}
        onClose={onClose}
        employee={editingEmployee}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}

function EmployeeForm({ isOpen, onClose, employee, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    skills: [],
    gender: '',
    status: 'active'
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        department: employee.department || '',
        skills: employee.skills || [],
        gender: employee.gender || '',
        status: employee.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: '',
        skills: [],
        gender: '',
        status: 'active'
      });
    }
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: 'intermediate' }]
    }));
  };

  const updateSkill = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={employee ? FiEdit : FiPlus} color="pueblo.500" />
            <Text>{employee ? 'Edit Employee' : 'Add New Employee'}</Text>
          </HStack>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@company.com"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Select department"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    placeholder="Select gender"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Skills</FormLabel>
                <VStack spacing={3} align="stretch">
                  {formData.skills.map((skill, index) => (
                    <HStack key={index}>
                      <Input
                        placeholder="Skill name"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                        flex={1}
                      />
                      <Select
                        value={skill.level}
                        onChange={(e) => updateSkill(index, 'level', e.target.value)}
                        w="150px"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeSkill(index)}
                      >
                        <Icon as={FiTrash2} />
                      </Button>
                    </HStack>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addSkill}
                    leftIcon={<Icon as={FiPlus} />}
                  >
                    Add Skill
                  </Button>
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="pueblo">
                {employee ? 'Update Employee' : 'Add Employee'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 