export type Lang = "curl" | "js" | "python";

export const generateSnippets: Record<Lang, string> = {
    curl: `curl -X POST https://manimflow.com/api/v1/generate \\
  -H "x-api-key: sk_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "explain bubble sort with step-by-step visualization",
    "quality": "low"
  }'`,
    js: `const response = await fetch('https://manimflow.com/api/v1/generate', {
  method: 'POST',
  headers: {
    'x-api-key': 'sk_YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'explain bubble sort with step-by-step visualization',
    quality: 'low',
  }),
});

const { jobId } = await response.json();
console.log('Job queued:', jobId);`,
    python: `import requests
 
response = requests.post(
    'https://manimflow.com/api/v1/generate',
    headers={
        'x-api-key': 'sk_YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'prompt': 'explain bubble sort with step-by-step visualization',
        'quality': 'low',
    }
)
 
data = response.json()
print(data['jobId'])`,
};

export const pollSnippets: Record<Lang, string> = {
    curl: `curl https://manimflow.com/api/v1/jobs/JOB_ID \\
  -H "x-api-key: sk_YOUR_API_KEY"`,
    js: `async function waitForVideo(jobId, apiKey) {
  while (true) {
    const res = await fetch(\`https://manimflow.com/api/v1/jobs/\${jobId}\`, {
      headers: { 'x-api-key': apiKey },
    });
    const data = await res.json();
 
    if (data.status === 'completed') return data.videoUrl;
    if (data.status === 'failed') throw new Error(data.error);
 
    // wait 3 seconds before polling again
    await new Promise(r => setTimeout(r, 3000));
  }
}`,
    python: `import time, requests
 
def wait_for_video(job_id, api_key):
    while True:
        time.sleep(3)
        res = requests.get(
            f'https://manimflow.com/api/v1/jobs/{job_id}',
            headers={'x-api-key': api_key}
        )
        data = res.json()
 
        if data['status'] == 'completed':
            return data['videoUrl']
        if data['status'] == 'failed':
            raise Exception(data['error'])`,
};

export const fullExampleSnippets: Record<"js" | "python", string> = {
    js: `
const API_KEY = 'sk_YOUR_API_KEY';
const BASE = 'https://manimflow.com/api/v1';
 
async function generateVideo(prompt, quality = 'low') {
  // 1. Submit the job
  const genRes = await fetch(\`\${BASE}/generate\`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, quality }),
  });
 
  if (!genRes.ok) {
    const err = await genRes.json();
    throw new Error(\`Generation failed: \${err.message}\`);
  }
 
  const { jobId } = await genRes.json();
  console.log('Job queued:', jobId);
 
  // 2. Poll until done (max 3 minutes)
  const deadline = Date.now() + 3 * 60 * 1000;
 
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000));
 
    const pollRes = await fetch(\`\${BASE}/jobs/\${jobId}\`, {
      headers: { 'x-api-key': API_KEY },
    });
    const job = await pollRes.json();
 
    if (job.status === 'completed') {
      console.log('Video ready:', job.videoUrl);
      return job.videoUrl;
    }
 
    if (job.status === 'failed') {
      throw new Error(\`Render failed: \${job.error}\`);
    }
  }
 
  throw new Error('Timed out waiting for video');
}
 
// Usage
generateVideo('explain the Pythagorean theorem visually', 'medium')
  .then(url => console.log('Done!', url))
  .catch(console.error);`,
    python: `import time, requests
 
API_KEY = 'sk_YOUR_API_KEY'
BASE = 'https://manimflow.com/api/v1'
HEADERS = {'x-api-key': API_KEY, 'Content-Type': 'application/json'}
 
def generate_video(prompt, quality='low'):
    # 1. Submit the job
    res = requests.post(f'{BASE}/generate', headers=HEADERS, json={
        'prompt': prompt,
        'quality': quality,
    })
    res.raise_for_status()
    job_id = res.json()['jobId']
    print(f'Job queued: {job_id}')
 
    # 2. Poll until done (max 3 minutes)
    deadline = time.time() + 180
 
    while time.time() < deadline:
        time.sleep(3)
        poll = requests.get(
            f'{BASE}/jobs/{job_id}',
            headers=HEADERS
        )
        job = poll.json()
 
        if job['status'] == 'completed':
            print(f"Video ready: {job['videoUrl']}")
            return job['videoUrl']
 
        if job['status'] == 'failed':
            raise Exception(f"Render failed: {job['error']}")
 
    raise TimeoutError('Timed out waiting for video')
 
# Usage
url = generate_video('explain the Pythagorean theorem visually', 'medium')
print('Done!', url)`,
};
