'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, TextField, IconButton, CircularProgress, Paper, Stack, useTheme } from '@mui/material';
import Footer from '@/components/Footer';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

const ChatContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#F0F2F5',
  padding: '20px',
});

const ChatBox = styled(Paper)({
  width: '100%',
  maxWidth: '600px',
  height: '70%',
  borderRadius: '15px',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#FFFFFF',
});

const MessageBubble = styled(Box)(({ isUser }) => ({
  display: 'inline-block',
  padding: '10px 15px',
  borderRadius: '20px',
  maxWidth: '70%',
  marginBottom: '10px',
  color: isUser ? '#ffffff' : '#000000',
  backgroundColor: isUser ? '#FF6600' : '#E0E0E0', 
  alignSelf: isUser ? 'flex-end' : 'flex-start',
}));

export default function ChatWithPDF() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(''); 

  const theme = useTheme();

  useEffect(() => {

    if (router.query && router.query.summary) {
      try {
      
        const decodedSummary = decodeURIComponent(router.query.summary);
        const parsedSummary = JSON.parse(decodedSummary);
        setSummary(typeof parsedSummary === 'string' ? parsedSummary : decodedSummary);
      } catch (e) {
       
        setSummary(decodeURIComponent(router.query.summary) || '');
      }
    }
  }, [router.query]);

  useEffect(() => {

    setResponses([{ user: '', assistant: "Hi! How can I help you today?" }]);
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/query-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message, summary }), 
      });

      if (!response.ok) {
        throw new Error('Failed to get a response');
      }

      const data = await response.json();
      setResponses([...responses, { user: message, assistant: data.answer }]);
      setMessage('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <ChatContainer>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ color: '#FF6600', fontWeight: 'bold', textShadow: '0 0 10px orange' }}
        >
          Chat with PDF
        </Typography>

        <ChatBox>
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
            sx={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                boxShadow: `inset 0 0 6px ${theme.palette.divider}`,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.primary.main,
                borderRadius: '10px',
              },
            }}
          >
            {responses.map((msg, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                {msg.user && <MessageBubble isUser={true}><strong>You:</strong> {msg.user}</MessageBubble>}
                {msg.assistant && <MessageBubble isUser={false}><strong>Assistant:</strong> {msg.assistant}</MessageBubble>}
              </Box>
            ))}
            {loading && <CircularProgress size={24} sx={{ color: '#FF6600' }} />}
            {error && <Typography sx={{ color: 'red' }}>{error}</Typography>}
          </Stack>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Type your question or request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ mr: 1, backgroundColor: '#FFFFFF' }} 
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={loading}
              sx={{ bgcolor: '#FF6600', ':hover': { bgcolor: '#CC5200' } }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <SendIcon />}
            </IconButton>
          </Box>
        </ChatBox>

        <Footer />
      </ChatContainer>
    </>
  );
}
