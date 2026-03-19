"use strict";Object.defineProperty(exports, "__esModule", {value: true});exports. default = {
  openapi: '3.0.0',
  info: {
    title: 'GoBarber API',
    version: '1.0.0',
    description: 'API REST do GoBarber — agendamento entre clientes e prestadores de serviço (barbearia).',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Servidor de desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT retornado em POST /sessions. Use: Bearer {token}',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          provider: { type: 'boolean', example: false },
          avatar: { $ref: '#/components/schemas/File' },
        },
      },
      File: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          path: { type: 'string' },
          url: { type: 'string', description: 'URL pública do arquivo' },
        },
      },
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          date: { type: 'string', format: 'date-time' },
          past: { type: 'boolean' },
          cancelable: { type: 'boolean' },
          user_id: { type: 'integer' },
          provider_id: { type: 'integer' },
          canceled_at: { type: 'string', format: 'date-time', nullable: true },
          user: { $ref: '#/components/schemas/User' },
          provider: { $ref: '#/components/schemas/User' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          content: { type: 'string' },
          user: { type: 'integer' },
          read: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AvailableSlot: {
        type: 'object',
        properties: {
          time: { type: 'string', example: '09:00' },
          value: { type: 'string', format: 'date-time' },
          available: { type: 'boolean' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Validation fails' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: {
          200: {
            description: 'OK',
            content: {
              'text/plain': { schema: { type: 'string', example: 'ok' } },
            },
          },
        },
      },
    },
    '/users': {
      post: {
        summary: 'Criar usuário',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'João Silva' },
                  email: { type: 'string', format: 'email', example: 'joao@email.com' },
                  password: { type: 'string', minLength: 6, example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Usuário criado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    provider: { type: 'boolean' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validação falhou ou e-mail já existe',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } },
            },
          },
        },
      },
      put: {
        summary: 'Atualizar perfil do usuário logado',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  oldPassword: { type: 'string', minLength: 6 },
                  password: { type: 'string', minLength: 6 },
                  confirmPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Perfil atualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    avatar: { $ref: '#/components/schemas/File' },
                  },
                },
              },
            },
          },
          400: { description: 'Validação falhou' },
          401: { description: 'Token inválido ou senha atual incorreta' },
        },
      },
    },
    '/sessions': {
      post: {
        summary: 'Login (obter token JWT)',
        tags: ['Sessions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT para usar em Authorization: Bearer {token}' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Usuário não encontrado ou senha incorreta',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    '/providers': {
      get: {
        summary: 'Listar prestadores de serviço',
        tags: ['Providers'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de prestadores',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
          401: { description: 'Token não informado ou inválido' },
        },
      },
    },
    '/providers/{providerId}/available': {
      get: {
        summary: 'Horários disponíveis de um prestador',
        tags: ['Providers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'providerId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'integer', description: 'Timestamp do dia (ex: new Date().getTime())' },
          },
        ],
        responses: {
          200: {
            description: 'Lista de horários com disponibilidade',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AvailableSlot' },
                },
              },
            },
          },
          400: { description: 'Data inválida' },
          401: { description: 'Token inválido' },
        },
      },
    },
    '/appointments': {
      get: {
        summary: 'Listar agendamentos do usuário logado',
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Lista de agendamentos (não cancelados)',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Appointment' },
                },
              },
            },
          },
          401: { description: 'Token inválido' },
        },
      },
      post: {
        summary: 'Criar agendamento',
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['provider_id', 'date'],
                properties: {
                  provider_id: { type: 'integer' },
                  date: { type: 'string', format: 'date-time', example: '2025-03-10T14:00:00.000Z' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Agendamento criado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Appointment' } },
            },
          },
          400: {
            description: 'Validação falhou, data no passado ou horário indisponível',
          },
          401: {
            description: 'Apenas prestadores podem ser agendados',
          },
        },
      },
    },
    '/appointments/{id}': {
      delete: {
        summary: 'Cancelar agendamento',
        tags: ['Appointments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Agendamento cancelado (e-mail enviado em background)',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Appointment' } },
            },
          },
          401: {
            description: 'Sem permissão ou fora do prazo (mín. 2h antes)',
          },
        },
      },
    },
    '/schedule': {
      get: {
        summary: 'Agenda do prestador (apenas para usuários provider)',
        tags: ['Schedule'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date', example: '2025-03-10' },
          },
        ],
        responses: {
          200: {
            description: 'Agendamentos do dia',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Appointment' },
                },
              },
            },
          },
          401: { description: 'Usuário não é prestador ou token inválido' },
        },
      },
    },
    '/notifications': {
      get: {
        summary: 'Listar notificações do prestador',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de notificações (apenas para provider)',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Notification' },
                },
              },
            },
          },
          401: { description: 'Apenas prestadores ou token inválido' },
        },
      },
    },
    '/notifications/{id}': {
      put: {
        summary: 'Marcar notificação como lida',
        tags: ['Notifications'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Notificação atualizada',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Notification' } },
            },
          },
          401: { description: 'Token inválido' },
        },
      },
    },
    '/files': {
      post: {
        summary: 'Upload de arquivo (ex.: avatar)',
        tags: ['Files'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Arquivo criado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    path: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { description: 'Token inválido' },
        },
      },
    },
  },
};
