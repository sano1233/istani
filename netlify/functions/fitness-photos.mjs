import { createApi } from 'unsplash-js';

const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_KEY;
let cachedClient;

function getUnsplashClient() {
  if (!accessKey) {
    throw new Error('Unsplash access key is not configured.');
  }

  if (!cachedClient) {
    const init = { accessKey };
    if (typeof fetch === 'function') {
      init.fetch = (...args) => fetch(...args);
    }

    cachedClient = createApi(init);
  }

  return cachedClient;
}

function mapPhoto(photo) {
  return {
    id: photo?.id ?? null,
    description: photo?.alt_description ?? null,
    width: photo?.width ?? null,
    height: photo?.height ?? null,
    imageUrl: photo?.urls?.regular ?? null,
    thumbUrl: photo?.urls?.small ?? null,
    unsplashUrl: photo?.links?.html ?? null,
    photographer: photo?.user?.name ?? null,
    photographerProfile: photo?.user?.links?.html ?? null,
  };
}

export async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Allow': 'GET',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const unsplash = getUnsplashClient();
    const response = await unsplash.search.getPhotos({
      query: 'fitness',
      perPage: 5,
      orientation: 'landscape',
      orderBy: 'relevant',
    });

    if (!response?.response?.results) {
      throw new Error('Unexpected response from Unsplash API.');
    }

    const photos = response.response.results.map(mapPhoto);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({ photos }),
    };
  } catch (error) {
    console.error('Failed to fetch fitness photos from Unsplash:', error);

    const statusCode = accessKey ? 502 : 500;
    const message = accessKey
      ? 'Failed to fetch fitness photos.'
      : 'Unsplash access key is not configured.';

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: message }),
    };
  }
}
