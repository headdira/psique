// src/api/apiDates.ts - VERSÃO CORRIGIDA

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://afrodite-v1.netlify.app/api';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'bb_9f3a7c21e4b84d6fa92c1e8b5d0a4c7e';

export const apiService = {
  // Configuração comum para todas as requisições
  async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Accept': 'application/json',
      };

      const config: RequestInit = {
        method,
        headers,
        cache: 'no-cache',
      };

      // Para métodos que requerem body
      if (data && method !== 'GET' && method !== 'HEAD') {
        config.body = JSON.stringify(data);
      }

      console.log(`[API REQUEST] ${method} ${url}`, data ? { data } : '');

      const response = await fetch(url, config);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
      }

      console.log(`[API RESPONSE] ${method} ${url}:`, {
        status: response.status,
        ok: response.ok,
        data: responseData
      });

      if (!response.ok) {
        const errorMessage = responseData?.error || 
                           responseData?.message || 
                           `Erro ${response.status}: ${response.statusText}`;
        
        return {
          ok: false,
          error: errorMessage,
          status: response.status,
          data: responseData
        };
      }

      return {
        ok: true,
        data: responseData,
        status: response.status
      };

    } catch (error) {
      console.error('[API ERROR]', error);
      
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Falha na conexão com o servidor',
        status: 0,
        data: null
      };
    }
  },

  // ========== DATES ==========

  // Listar todos os dates
  async getDates(params?: { 
    page?: number; 
    limit?: number; 
    user_id?: string;
    only_premium?: boolean;
    date_id?: string;
  }) {
    let endpoint = '/dates';
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.only_premium) queryParams.append('only_premium', 'true');
      if (params.date_id) queryParams.append('date_id', params.date_id);
      
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    
    const result = await this.makeRequest(endpoint, 'GET');
    
    if (result.ok) {
      if (params?.date_id && result.data?.date) {
        return {
          ok: true,
          dates: [result.data.date],
          total: 1,
          page: 1,
          limit: 1
        };
      }
      
      return {
        ok: true,
        dates: result.data?.dates || [],
        total: result.data?.total || 0,
        page: result.data?.page || 1,
        limit: result.data?.limit || 20
      };
    }
    
    return {
      ok: false,
      error: result.error,
      dates: []
    };
  },

  // Buscar date específico
  async getDate(dateId: string) {
    return this.getDates({ date_id: dateId });
  },

  // Criar um date
  async createDate(dateData: {
    creator_user_id: string;
    location: string;
    datetime: string;
    type: string;
    payment: string;
    max_participants: number;
    tone: string;
    premium: boolean;
    description: string;
    creator_is_premium: boolean;
  }) {
    const result = await this.makeRequest('/dates', 'POST', dateData);
    
    if (result.ok) {
      return {
        ok: true,
        date: result.data?.date
      };
    }
    
    return {
      ok: false,
      error: result.error
    };
  },

  // Editar um date
  async updateDate(updateData: {
    creator_user_id: string;
    date_id: string;
    updates: {
      location?: string;
      datetime?: string;
      type?: string;
      payment?: string;
      max_participants?: number;
      tone?: string;
      description?: string;
      premium?: boolean;
    };
    creator_is_premium: boolean;
  }) {
    const result = await this.makeRequest('/dates', 'PUT', updateData);
    
    if (result.ok) {
      return {
        ok: true,
        date: result.data?.date
      };
    }
    
    return {
      ok: false,
      error: result.error
    };
  },

  // Deletar um date
  async deleteDate(deleteData: {
    creator_user_id: string;
    date_id: string;
  }) {
    const result = await this.makeRequest('/dates', 'DELETE', deleteData);
    
    if (result.ok) {
      return {
        ok: true,
        message: result.data?.message
      };
    }
    
    return {
      ok: false,
      error: result.error
    };
  },

  // ========== SUBMISSÕES ==========

  // Submeter a um date - CORRIGIDO
  async submitToDate(
    dateId: string,
    user_id: string,
    message?: string,
    user_name?: string,
    user_photo?: string
  ) {
    const submitData = {
      user_id,
      message: message || '',
      user_name: user_name || 'Usuário',
      user_photo: user_photo || null
    };
    
    console.log(`[SUBMIT] Enviando para /dates/${dateId}/submit:`, submitData);
    
    const result = await this.makeRequest(`/dates/${dateId}/submit`, 'POST', submitData);
    
    if (result.ok) {
      return {
        ok: true,
        submission: result.data?.submission,
        message: result.data?.message || 'Submissão enviada com sucesso!'
      };
    }
    
    return {
      ok: false,
      error: result.error || 'Erro ao enviar submissão',
      data: result.data
    };
  },

  // Listar submissões de um date (apenas criador) - CORRIGIDO
  async getDateSubmissions(dateId: string, creator_user_id: string) {
    try {
      console.log(`[GET SUBMISSIONS] Buscando submissões para date ${dateId}, criador ${creator_user_id}`);
      
      const result = await this.makeRequest(
        `/dates/${dateId}/submissions?creator_user_id=${encodeURIComponent(creator_user_id)}`, 
        'GET'
      );
      
      console.log(`[GET SUBMISSIONS RESULT]`, result);
      
      if (result.ok) {
        // A API pode retornar um array ou um objeto com propriedade submissions
        const submissions = Array.isArray(result.data) ? result.data : 
                           result.data?.submissions || [];
        
        return {
          ok: true,
          submissions: submissions,
          counters: result.data?.counters,
          date_info: result.data?.date_info
        };
      }
      
      return {
        ok: false,
        error: result.error || 'Erro ao buscar submissões',
        submissions: []
      };
    } catch (error) {
      console.error('[GET SUBMISSIONS ERROR]', error);
      return {
        ok: false,
        error: 'Erro de conexão',
        submissions: []
      };
    }
  },

  // Ver status da minha submissão - CORRIGIDO
  async getMySubmission(dateId: string, userId: string) {
    try {
      console.log(`[MY SUBMISSION] Verificando submissão do usuário ${userId} no date ${dateId}`);
      
      const result = await this.makeRequest(
        `/dates/${dateId}/my-submission?user_id=${encodeURIComponent(userId)}`, 
        'GET'
      );
      
      console.log(`[MY SUBMISSION RESULT]`, result);
      
      if (result.ok) {
        return {
          ok: true,
          user_status: result.data?.user_status || 'not_submitted',
          submission: result.data?.submission,
          can_submit: result.data?.can_submit !== false,
          date_info: result.data?.date_info
        };
      }
      
      // Se der erro 404, o usuário não submeteu ainda
      if (result.status === 404) {
        return {
          ok: true,
          user_status: 'not_submitted',
          can_submit: true,
          date_info: result.data?.date_info
        };
      }
      
      return {
        ok: false,
        error: result.error,
        user_status: 'not_submitted',
        can_submit: true
      };
    } catch (error) {
      console.error('[MY SUBMISSION ERROR]', error);
      return {
        ok: false,
        error: 'Erro de conexão',
        user_status: 'not_submitted',
        can_submit: true
      };
    }
  },

  // Cancelar submissão - CORRIGIDO
  async cancelSubmission(dateId: string, user_id: string) {
    const cancelData = {
      user_id,
      date_id: dateId // Inclui date_id no body conforme a API espera
    };
    
    console.log(`[CANCEL SUBMISSION] Cancelando submissão do usuário ${user_id} no date ${dateId}`);
    
    const result = await this.makeRequest(
      `/dates/${dateId}/submission`, 
      'DELETE', 
      cancelData
    );
    
    console.log(`[CANCEL SUBMISSION RESULT]`, result);
    
    if (result.ok) {
      return {
        ok: true,
        message: result.data?.message || 'Submissão cancelada com sucesso!'
      };
    }
    
    return {
      ok: false,
      error: result.error || 'Erro ao cancelar submissão'
    };
  },

  // Responder submissão (criador aceitar/rejeitar) - CORREÇÃO CRÍTICA
  async respondToSubmission(
    dateId: string,
    respondData: {
      creator_user_id: string;
      requester_user_id: string;
      accept: boolean;
      reason?: string;
    }
  ) {
    console.log(`[RESPOND TO SUBMISSION] Iniciando...`);
    console.log('Date ID:', dateId);
    console.log('Respond Data:', respondData);
    
    // Formato EXATO baseado no seu código do backend
    // A API espera: POST /dates/:dateId/respond
    const payload = {
      creator_user_id: respondData.creator_user_id,
      requester_user_id: respondData.requester_user_id,
      accept: respondData.accept,
      reason: respondData.reason || (respondData.accept ? 'Bem-vindo ao date!' : 'Não há mais vagas disponíveis')
      // NOTA: Não inclua date_id no body - ele já está na URL
    };
    
    console.log(`[RESPOND PAYLOAD] Enviando payload:`, payload);
    
    try {
      // O endpoint é: /dates/{dateId}/respond
      const result = await this.makeRequest(
        `/dates/${dateId}/respond`, 
        'POST', 
        payload
      );
      
      console.log(`[RESPOND RESULT] Status: ${result.status}, OK: ${result.ok}`);
      console.log(`[RESPOND RESULT DATA]`, result.data);
      
      if (result.ok) {
        return {
          ok: true,
          message: result.data?.message || 
                  (respondData.accept ? 'Submissão aceita com sucesso!' : 'Submissão rejeitada.'),
          submission: result.data?.submission
        };
      }
      
      // Se falhar, verifique o erro específico
      const errorMessage = result.error || 'Erro desconhecido ao responder submissão';
      console.error(`[RESPOND ERROR] ${errorMessage}`);
      
      // Tente uma abordagem alternativa se a primeira falhar
      if (result.status === 400 || result.status === 404) {
        console.log(`[RESPOND] Tentando formato alternativo...`);
        
        // Alternativa: incluir date_id no body
        const payloadAlt = {
          ...payload,
          date_id: dateId
        };
        
        const resultAlt = await this.makeRequest(
          `/dates/${dateId}/respond`, 
          'POST', 
          payloadAlt
        );
        
        if (resultAlt.ok) {
          return {
            ok: true,
            message: resultAlt.data?.message,
            submission: resultAlt.data?.submission
          };
        }
        
        return {
          ok: false,
          error: resultAlt.error || errorMessage,
          data: resultAlt.data
        };
      }
      
      return {
        ok: false,
        error: errorMessage,
        data: result.data
      };
      
    } catch (error) {
      console.error(`[RESPOND EXCEPTION]`, error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Erro de conexão',
        data: null
      };
    }
  },

  // ========== FUNÇÕES DE DIAGNÓSTICO ==========

  // Testar a API de responder submissão diretamente
  async testRespondSubmission(
    dateId: string,
    creatorId: string,
    requesterId: string,
    accept: boolean
  ) {
    console.log(`[TEST RESPOND] Testando endpoint /dates/${dateId}/respond`);
    
    const testData = {
      creator_user_id: creatorId,
      requester_user_id: requesterId,
      accept: accept,
      reason: 'Teste direto da API'
    };
    
    // Teste 1: Sem date_id no body
    console.log(`[TEST 1] Enviando sem date_id no body`);
    const result1 = await this.makeRequest(
      `/dates/${dateId}/respond`,
      'POST',
      testData
    );
    
    console.log(`[TEST 1 RESULT]`, result1);
    
    if (result1.ok) {
      return {
        ok: true,
        test: 'Teste 1 - Sucesso',
        data: result1.data
      };
    }
    
    // Teste 2: Com date_id no body
    console.log(`[TEST 2] Enviando com date_id no body`);
    const testData2 = {
      ...testData,
      date_id: dateId
    };
    
    const result2 = await this.makeRequest(
      `/dates/${dateId}/respond`,
      'POST',
      testData2
    );
    
    console.log(`[TEST 2 RESULT]`, result2);
    
    if (result2.ok) {
      return {
        ok: true,
        test: 'Teste 2 - Sucesso',
        data: result2.data
      };
    }
    
    // Teste 3: Usando PUT em vez de POST
    console.log(`[TEST 3] Tentando método PUT`);
    const result3 = await this.makeRequest(
      `/dates/${dateId}/respond`,
      'PUT',
      testData
    );
    
    console.log(`[TEST 3 RESULT]`, result3);
    
    if (result3.ok) {
      return {
        ok: true,
        test: 'Teste 3 - Sucesso',
        data: result3.data
      };
    }
    
    return {
      ok: false,
      error: 'Todos os testes falharam',
      details: {
        test1: result1,
        test2: result2,
        test3: result3
      }
    };
  },

  // Verificar estrutura do date
  async inspectDate(dateId: string) {
    try {
      const dateResult = await this.getDate(dateId);
      
      if (dateResult.ok && dateResult.dates && dateResult.dates.length > 0) {
        const date = dateResult.dates[0];
        console.log(`[INSPECT DATE] Date encontrado:`, {
          id: date.id,
          creator_user_id: date.creator_user_id,
          submisoes: date.submisoes ? Object.keys(date.submisoes).length : 0,
          max_participants: date.max_participants
        });
        
        // Verificar se tem submissões
        if (date.submisoes) {
          console.log(`[INSPECT DATE] Submissões:`, Object.keys(date.submisoes).map(key => ({
            user_id: key,
            status: date.submisoes[key]?.status
          })));
        }
        
        return {
          ok: true,
          date: date,
          hasSubmissions: date.submisoes && Object.keys(date.submisoes).length > 0
        };
      }
      
      return {
        ok: false,
        error: 'Date não encontrado'
      };
    } catch (error) {
      console.error('[INSPECT DATE ERROR]', error);
      return {
        ok: false,
        error: 'Erro ao inspecionar date'
      };
    }
  },

  // Testar conexão geral
  async testConnection() {
    try {
      const result = await this.makeRequest('/dates?limit=1', 'GET');
      return {
        ok: result.ok,
        status: result.status,
        message: result.ok ? 'Conexão com API estabelecida' : 'Erro na API',
        data: result.data
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        message: 'Falha na conexão'
      };
    }
  }
};