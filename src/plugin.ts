import type { Plugin } from '@elizaos/core';
import {
  type Action,
  type ActionResult,
  type Content,
  type GenerateTextParams,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelType,
  type Provider,
  type ProviderResult,
  Service,
  type State,
  logger,
  type MessagePayload,
  type WorldPayload,
  EventType,
} from '@elizaos/core';
import { fal } from '@fal-ai/client';
import { z } from 'zod';

/**
 * Defines the configuration schema for a plugin, including the validation rules for the plugin name.
 *
 * @type {import('zod').ZodObject<{ EXAMPLE_PLUGIN_VARIABLE: import('zod').ZodString }>}
 */
const configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z
    .string()
    .min(1, 'FalAI plugin variable is not provided')
    .optional()
    .transform((val) => {
      if (!val) {
        logger.warn('FalAI plugin variable is not provided (this is expected)');
      }
      return val;
    }),
});

const generateVideoAction: Action = {
  name: 'TEXT_TO_VIDEO',
  similes: ['CREATE_VIDEO', 'MAKE_VIDEO', 'GENERATE_VIDEO', 'VIDEO_FROM_TEXT'],
  description: 'Generate a video from text using MiniMax Hailuo-02',

  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State | undefined
  ): Promise<boolean> => {
    const falKey = _runtime.getSetting('FAL_KEY'); 
    if (!falKey) { 
      logger.error('FAL_KEY not found in environment variables'); 
      return false; 
    } 
    return true; 
  
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown> = {},
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {

    try { 
      fal.config({ credentials: _runtime.getSetting('FAL_KEY') }); 

      const respDescrption = 'I need a description' 
      const text = message.content?.text;
      if (!text) 
        return { 
          success: false, 
          text: respDescrption,
          data: {
            actions: ['TEXT_TO_VIDEO'],
            source: message.content.source,
          } 
        };
      
      let prompt = text.replace(/^(create video:|make video:)/i, '').trim(); 
      if (!prompt) 
        return { 
          success: false, 
          text: respDescrption,
          data: {
            actions: ['TEXT_TO_VIDEO'],
            source: message.content.source,
          }
        }; 
      
      const result = await fal.subscribe("fal-ai/minimax/hailuo-02/standard/text-to-video", { 
        input: { prompt, duration: "6" }, logs: true
      }); 
      
      const videoUrl = result.data.video.url; 
      if (callback) 
        await callback({ 
              text: `✅ Video ready! ${videoUrl}` 
            }); 
      return { 
        success: true, 
        text: 'Video generated', data: { videoUrl, prompt } 
      }; 
    } catch (error) { 
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)),
        data: {
          actions: ['TEXT_TO_VIDEO'],
          source: message.content.source,
        }
      }; 
    } 

  },

  examples: [ 
    [{ name: '{{user}}', content: { text: 'Create video: dolphins jumping' } }, 
     { name: '{{agent}}', content: { text: 'Creating video!', actions: ['TEXT_TO_VIDEO'] }}] 
  ], 

};

const quickProvider: Provider = {
  name: 'QUICK_PROVIDER',
  description: 'A simple example provider',

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State | undefined
  ): Promise<ProviderResult> => {
    return {
      text: 'I am a provider',
      values: {},
      data: {},
    };
  },
};

export class StarterService extends Service {
  static override serviceType = 'starter';

  override capabilityDescription =
    'This is a starter service which is attached to the agent through the starter plugin.';

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static override async start(runtime: IAgentRuntime): Promise<Service> {
    logger.info('Starting starter service');
    const service = new StarterService(runtime);
    return service;
  }

  static override async stop(runtime: IAgentRuntime): Promise<void> {
    logger.info('Stopping starter service');
    const service = runtime.getService(StarterService.serviceType);
    if (!service) {
      throw new Error('Starter service not found');
    }
    if ('stop' in service && typeof service.stop === 'function') {
      await service.stop();
    }
  }

  override async stop(): Promise<void> {
    logger.info('Starter service stopped');
  }
}

export const starterPlugin: Plugin = {
  name: 'plugin-fal-ai',
  description: 'Generate videos using fal.ai MiniMax Hailuo-02', 
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE,
  },
  async init(config: Record<string, string>) {
    logger.info('Initializing plugin-fal-ai');
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // Set all environment variables at once
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (
      _runtime,
      { prompt, stopSequences = [] }: GenerateTextParams
    ) => {
      return 'Never gonna give you up, never gonna let you down, never gonna run around and desert you...';
    },
    [ModelType.TEXT_LARGE]: async (
      _runtime,
      {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7,
      }: GenerateTextParams
    ) => {
      return 'Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...';
    },
  },
  routes: [
    {
      name: 'api-status',
      path: '/api/status',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        res.json({
          status: 'ok',
          plugin: 'plugin-fal-ai',
          timestamp: new Date().toISOString(),
        });
      },
    },
  ],
  events: {
    [EventType.MESSAGE_RECEIVED]: [
      async (params: MessagePayload) => {
        logger.debug('MESSAGE_RECEIVED event received');
        logger.debug({ message: params.message }, 'Message:');
      },
    ],
    [EventType.VOICE_MESSAGE_RECEIVED]: [
      async (params: MessagePayload) => {
        logger.debug('VOICE_MESSAGE_RECEIVED event received');
        logger.debug({ message: params.message }, 'Message:');
      },
    ],
    [EventType.WORLD_CONNECTED]: [
      async (params: WorldPayload) => {
        logger.debug('WORLD_CONNECTED event received');
        logger.debug({ world: params.world }, 'World:');
      },
    ],
    [EventType.WORLD_JOINED]: [
      async (params: WorldPayload) => {
        logger.debug('WORLD_JOINED event received');
        logger.debug({ world: params.world }, 'World:');
      },
    ],
  },
  services: [StarterService],
  actions: [generateVideoAction],
  providers: [quickProvider],
  // dependencies: ['@elizaos/plugin-knowledge'], <--- plugin dependencies go here (if requires another plugin)
};

export default starterPlugin;
