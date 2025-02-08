import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'; // Fallback URL if env var is not set

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServerAwake, setIsServerAwake] = useState(false);

  // Wake up the server on component mount
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        const response = await fetch(`${API_URL}/ping`);
        if (response.ok) {
          setIsServerAwake(true);
          console.log('Server is awake');
        }
      } catch (error) {
        console.log('Server is starting up, might take a minute...');
      }
    };

    wakeUpServer();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from the server');
      }

      const data = await response.json();
      
      const aiResponse: Message = {
        text: data.answer || 'Sorry, I could not process your request.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        text: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ height: '80vh', display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <img 
            src="/compass-rose.jpeg" 
            alt="Compass Rose" 
            style={{ 
              width: '50px', 
              height: '50px', 
              objectFit: 'contain' 
            }} 
          />
          <Typography variant="h5" component="h1" gutterBottom>
            Outward Bound Chat Assistant
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <ListItemText
                    primary={
                      message.sender === 'ai' ? (
                        <Box sx={{ 
                          '& p': { m: 0 },
                          '& strong': { fontWeight: 600 },
                          '& ul, & ol': { m: 0, pl: 2 }
                        }}>
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </Box>
                      ) : (
                        message.text
                      )
                    }
                    secondary={message.timestamp.toLocaleTimeString()}
                  />
                </Paper>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              textAlign: 'center',
              fontStyle: 'italic',
              mb: 1
            }}
          >
            Ask me a packing question about your upcoming mountaineering course
          </Typography>
          {!isServerAwake && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Waking up the server, please wait...
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setInputMessage("What kind of base layers should I bring?");
              }}
              sx={{ 
                textTransform: 'none',
                fontSize: '0.9rem',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white'
                }
              }}
            >
              "What kind of base layers should I bring?"
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setInputMessage("Do I need a rain coat?");
              }}
              sx={{ 
                textTransform: 'none',
                fontSize: '0.9rem',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white'
                }
              }}
            >
              "Do I need a rain coat?"
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setInputMessage("What can help me prepare for my course?");
              }}
              sx={{ 
                textTransform: 'none',
                fontSize: '0.9rem',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white'
                }
              }}
            >
              "What can help me prepare for my course?"
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
