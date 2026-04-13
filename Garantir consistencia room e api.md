
As alterações foram feitas para garantir a consistência entre o Room e a API:
1.
CartRepository.kt:
◦
Adicionado syncMutex para evitar que o processo de sincronização rode em duplicado.
◦
Adicionado um loop while(true) no syncCart para garantir que novas alterações locais (feitas durante a chamada de rede) sejam processadas imediatamente.
◦
Uso de NonCancellable ao atualizar o banco de dados, garantindo que se o Worker for interrompido logo após o sucesso da API, o estado local seja atualizado corretamente (evitando duplicidade no próximo ciclo).
◦
Correção Crítica: O item só é deletado do Room se quantity <= 0 E o delta for 0 (totalmente sincronizado).

2.
CartSyncScheduler.kt:
◦
Alterado de REPLACE para KEEP. Isso evita cancelar um worker que já está no meio de uma transação de rede/banco. Com o novo loop no syncCart, o worker atual já dará conta das novas mudanças.
3.
CartDao.kt:
◦
A query getCart agora filtra quantity > 0, escondendo itens que estão "aguardando deleção" apenas para terminar o sync do decremento na API.
◦
Removida a deleção automática no decreaseQuantityTransaction, passando essa responsabilidade para o syncCart após a confirmação da API.
Isso deve resolver as inconsistências onde itens sumiam prematuramente ou eram enviados com valores errados para o Laravel.