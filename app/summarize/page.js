

'use client';
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Box, Button, Container, Paper, Typography, CircularProgress, Divider } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import Footer from "@/components/Footer";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function PDFPage() {
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const router = useRouter();

  const handleUpload = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/loader`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading file');
      }

      const data = await response.json();
      console.log("File upload response: ", data);

      const loadedContent = data.map((page) => page.pageContent).join('\n');
      setResume(loadedContent);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.text(); 
      setSummary(data);

      // Store summary in local storage
      localStorage.setItem('pdfSummary', data);
    } catch (error) {
      setError(error.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleChat = () => {
    try {
      const path = '/chat-with-pdf';
      console.log('Navigating to:', path);
  
      // Ensure path is a string
      if (typeof path === 'string') {
        router.push(path);
      } else {
        console.error('Path is not a string:', path);
      }
    } catch (error) {
      console.error('Error in handleChat:', error);
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 1, bgcolor: '#121212', minHeight: '100vh', color: '#ffffff' }}>
        <Container maxWidth="md" sx={{ bgcolor: '#121212', minHeight: '100vh', color: '#ffffff' }}>
          <Box sx={{
            mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <Button onClick={() => router.push('/')} sx={{ mb: 4 }}>
              <Image 
                src="/left-arrow.png"  
                width={100}  
                height={100}
                style={{ objectFit: 'contain', cursor: 'pointer' }}
              />
            </Button>
            <Typography variant="h4" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold', textShadow: '0 0 10px orange' }}>
              PDF Query Quest
            </Typography>

            <Paper sx={{ p: 4, width: '100%', bgcolor: '#2c2c2c', borderRadius: '8px' }}>
              <Typography gutterBottom sx={{ color: '#ffffff' }}>
                Upload a PDF and generate a summary.
              </Typography>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{
                  backgroundColor: 'default',
                  color: 'white',
                  '&:hover': { backgroundColor: 'blue' },
                }}
              >
                Upload PDF
                <VisuallyHiddenInput
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                />
              </Button>

              {file && (
                <Typography sx={{ color: '#bbbbbb', mt: 2 }}>
                  {file.name} uploaded successfully!
                </Typography>
              )}

              {resume && (
                <>
                  <Button 
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: 'orange',
                      color: '#ffffff',
                      borderRadius: '25px',
                      marginTop: '20px',
                      ':hover': { bgcolor: 'darkorange' },
                    }}
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                  >
                    {summaryLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Generate Summary'}
                  </Button>

                  {summary && (
                    <Box sx={{ mt: 4 }}>
                      <Divider sx={{ mb: 2, bgcolor: 'orange' }} />
                      <Typography variant="h6" sx={{ color: '#ffffff' }}>
                        Summary:
                      </Typography>
                      <Typography sx={{ color: '#bbbbbb', whiteSpace: 'pre-wrap' }}>
                        {summary}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          bgcolor: 'green',
                          color: '#ffffff',
                          borderRadius: '25px',
                          marginTop: '20px',
                          ':hover': { bgcolor: 'darkgreen' },
                        }}
                        onClick={handleChat}
                      >
                        Chat with PDF
                      </Button>
                    </Box>
                  )}
                </>
              )}

              {error && (
                <Typography sx={{ color: 'red', mt: 2 }}>{error}</Typography>
              )}
            </Paper>
          </Box>

          <Footer />
        </Container>
      </Box>
    </>
  );
}
