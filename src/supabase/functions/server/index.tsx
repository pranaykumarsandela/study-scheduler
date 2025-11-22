import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-21f11fcf/health", (c) => {
  return c.json({ status: "ok" });
});

// Generate study plan endpoint
app.post("/make-server-21f11fcf/generate-study-plan", async (c) => {
  try {
    const body = await c.req.json();
    const { subject, duration } = body;

    if (!subject) {
      return c.json({ error: "Subject is required" }, 400);
    }

    console.log(`Generating study plan for: ${subject}, duration: ${duration || 'default'}`);

    // Generate a computer science study plan
    const plan = generateCSStudyPlan(subject, duration || 7);

    return c.json({
      success: true,
      plan,
      subject,
      duration: duration || 7
    });
  } catch (error) {
    console.error("Error generating study plan:", error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate study plan"
    }, 500);
  }
});

// Function to generate computer science study plans
function generateCSStudyPlan(subject: string, days: number) {
  const subjectLower = subject.toLowerCase();
  
  // Computer Science study plan templates
  const csTopics: Record<string, string[]> = {
    'data structures': [
      'Arrays and Strings - Basic operations and common algorithms',
      'Linked Lists - Single, Double, and Circular implementations',
      'Stacks and Queues - Implementation and applications',
      'Trees - Binary Trees, BST, AVL Trees',
      'Heaps - Min Heap, Max Heap, Priority Queue',
      'Hash Tables - Hash functions and collision resolution',
      'Graphs - Representations and traversal algorithms (BFS, DFS)',
      'Advanced Trees - B-Trees, Red-Black Trees, Tries',
      'Sorting Algorithms - Quick Sort, Merge Sort, Heap Sort',
      'Searching Algorithms - Binary Search variations',
      'Dynamic Programming - Common patterns',
      'Greedy Algorithms - Problem-solving techniques',
      'Graph Algorithms - Dijkstra, Bellman-Ford, MST',
      'String Algorithms - KMP, Rabin-Karp'
    ],
    'algorithms': [
      'Algorithm Complexity - Big O notation and analysis',
      'Recursion - Base cases and recursive thinking',
      'Divide and Conquer - Merge Sort, Quick Sort',
      'Dynamic Programming Basics - Memoization vs Tabulation',
      'Greedy Algorithms - Activity Selection, Huffman Coding',
      'Backtracking - N-Queens, Sudoku Solver',
      'Graph Traversal - BFS and DFS applications',
      'Shortest Path - Dijkstra and Bellman-Ford',
      'Minimum Spanning Tree - Kruskal and Prim algorithms',
      'String Matching - KMP, Boyer-Moore',
      'Advanced DP - Knapsack, LCS, Edit Distance',
      'Network Flow - Max Flow, Min Cut',
      'NP-Complete Problems - Understanding complexity classes',
      'Approximation Algorithms - Practical solutions'
    ],
    'operating systems': [
      'OS Fundamentals - Components and architecture',
      'Process Management - States, PCB, Context Switching',
      'CPU Scheduling - FCFS, SJF, Round Robin, Priority',
      'Process Synchronization - Critical Section Problem',
      'Deadlocks - Detection, Prevention, Avoidance',
      'Memory Management - Contiguous and Paging',
      'Virtual Memory - Demand Paging, Page Replacement',
      'File Systems - Structure and Implementation',
      'I/O Systems - Device Management',
      'Threading - User vs Kernel threads',
      'Concurrency Control - Semaphores, Monitors, Mutexes',
      'Disk Management - Scheduling algorithms',
      'Security and Protection - Access control',
      'Case Studies - Linux, Windows internals'
    ],
    'database': [
      'DBMS Fundamentals - Data Models and Architecture',
      'Relational Model - Relations, Keys, Integrity',
      'SQL Basics - DDL, DML, DCL commands',
      'Advanced SQL - Joins, Subqueries, Views',
      'Normalization - 1NF, 2NF, 3NF, BCNF',
      'Transaction Management - ACID properties',
      'Concurrency Control - Locking protocols',
      'Recovery Techniques - Log-based recovery',
      'Indexing - B+ Trees, Hash Indexing',
      'Query Optimization - Query processing',
      'NoSQL Databases - Document, Key-Value stores',
      'Database Security - Access control, SQL injection',
      'Distributed Databases - CAP theorem',
      'Database Design - ER Diagrams, Schema design'
    ],
    'computer networks': [
      'Network Fundamentals - OSI and TCP/IP models',
      'Physical Layer - Transmission media, encoding',
      'Data Link Layer - Framing, Error detection',
      'MAC Protocols - ALOHA, CSMA/CD, CSMA/CA',
      'Network Layer - IPv4, IPv6, Subnetting',
      'Routing Algorithms - Distance Vector, Link State',
      'Transport Layer - TCP and UDP',
      'Flow Control - Sliding Window protocols',
      'Congestion Control - TCP congestion algorithms',
      'Application Layer - HTTP, DNS, SMTP, FTP',
      'Network Security - Cryptography basics',
      'Wireless Networks - WiFi, Mobile networks',
      'Network Management - SNMP, Performance',
      'Modern Protocols - HTTP/2, WebSockets, QUIC'
    ],
    'machine learning': [
      'ML Fundamentals - Types of learning, workflow',
      'Linear Regression - Theory and implementation',
      'Logistic Regression - Binary classification',
      'Decision Trees - Construction and pruning',
      'Random Forests - Ensemble learning',
      'Support Vector Machines - Kernel methods',
      'Neural Networks - Backpropagation',
      'Deep Learning - CNNs for image processing',
      'Recurrent Networks - RNNs, LSTMs for sequences',
      'Unsupervised Learning - K-means, Hierarchical',
      'Dimensionality Reduction - PCA, t-SNE',
      'Model Evaluation - Cross-validation, metrics',
      'Regularization - L1, L2, Dropout',
      'Advanced Topics - Transfer Learning, GANs'
    ],
    'web development': [
      'HTML Fundamentals - Semantic markup, forms',
      'CSS Basics - Selectors, Box model, Flexbox',
      'CSS Grid - Layout techniques',
      'JavaScript Fundamentals - ES6+ features',
      'DOM Manipulation - Events and handlers',
      'Async JavaScript - Promises, Async/Await',
      'React Basics - Components, Props, State',
      'React Hooks - useState, useEffect, custom hooks',
      'State Management - Context API, Redux',
      'Backend Basics - Node.js, Express',
      'RESTful APIs - Design and implementation',
      'Database Integration - SQL and NoSQL',
      'Authentication - JWT, OAuth',
      'Deployment - CI/CD, Docker basics'
    ],
    'python': [
      'Python Basics - Syntax, data types, operators',
      'Control Flow - If/else, loops, functions',
      'Data Structures - Lists, tuples, dictionaries, sets',
      'Object-Oriented Programming - Classes, inheritance',
      'File Handling - Reading/writing files',
      'Exception Handling - Try/except blocks',
      'Modules and Packages - Imports, pip',
      'List Comprehensions - Advanced syntax',
      'Lambda Functions - Functional programming',
      'Decorators - Function wrappers',
      'Generators - Yield and iterators',
      'Multithreading - Concurrent execution',
      'Regular Expressions - Pattern matching',
      'Popular Libraries - NumPy, Pandas basics'
    ],
    'java': [
      'Java Basics - Syntax, data types, operators',
      'OOP Fundamentals - Classes, objects, methods',
      'Inheritance - Extends, super, method overriding',
      'Polymorphism - Method overloading, interfaces',
      'Abstraction - Abstract classes, interfaces',
      'Encapsulation - Access modifiers, getters/setters',
      'Exception Handling - Try-catch-finally',
      'Collections Framework - List, Set, Map',
      'Generics - Type parameters',
      'Multithreading - Thread class, Runnable',
      'File I/O - Streams, readers, writers',
      'JDBC - Database connectivity',
      'Java 8 Features - Lambda, Stream API',
      'Spring Framework - Dependency Injection basics'
    ],
    'c++': [
      'C++ Basics - Syntax, data types, I/O',
      'Functions - Declaration, definition, overloading',
      'Pointers - Memory addresses, pointer arithmetic',
      'References - Pass by reference',
      'Classes and Objects - Constructors, destructors',
      'Inheritance - Single, multiple, multilevel',
      'Polymorphism - Virtual functions, abstract classes',
      'Operator Overloading - Custom operators',
      'Templates - Function and class templates',
      'STL Containers - Vector, list, map, set',
      'STL Algorithms - Sort, find, transform',
      'Exception Handling - Try-catch blocks',
      'File Handling - Streams and file operations',
      'Smart Pointers - unique_ptr, shared_ptr'
    ]
  };

  // Find matching topics
  let topics: string[] = [];
  
  for (const [key, value] of Object.entries(csTopics)) {
    if (subjectLower.includes(key) || key.includes(subjectLower)) {
      topics = value;
      break;
    }
  }

  // If no match found, provide generic CS topics
  if (topics.length === 0) {
    topics = [
      `${subject} - Introduction and fundamentals`,
      `${subject} - Core concepts and terminology`,
      `${subject} - Basic operations and techniques`,
      `${subject} - Intermediate topics and patterns`,
      `${subject} - Advanced concepts`,
      `${subject} - Problem-solving strategies`,
      `${subject} - Best practices and optimization`,
      `${subject} - Real-world applications`,
      `${subject} - Common pitfalls and debugging`,
      `${subject} - Testing and validation`,
      `${subject} - Performance considerations`,
      `${subject} - Integration with other technologies`,
      `${subject} - Case studies and examples`,
      `${subject} - Review and practice problems`
    ];
  }

  // Distribute topics across days
  const topicsPerDay = Math.ceil(topics.length / days);
  const plan = [];

  for (let day = 1; day <= days; day++) {
    const startIdx = (day - 1) * topicsPerDay;
    const endIdx = Math.min(startIdx + topicsPerDay, topics.length);
    const dayTopics = topics.slice(startIdx, endIdx);

    if (dayTopics.length > 0) {
      plan.push({
        day,
        topics: dayTopics,
        focus: day === 1 ? 'Foundation' : 
               day === days ? 'Review & Practice' : 
               day <= Math.ceil(days / 2) ? 'Building Knowledge' : 'Advanced Concepts'
      });
    }
  }

  return plan;
}

Deno.serve(app.fetch);