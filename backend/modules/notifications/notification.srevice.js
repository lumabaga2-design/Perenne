// backend/modules/notifications/notification.service.js

const notificationModel = require('./notification.model');

class NotificationService {

  //  NOTIFICACIÓN DE LIKE 
  // cuando alguien da me gusta
  async notifyLike(senderId, receiverId, itemId, itemType) {
    // No notificamos si el usuario se da like a sí mismo
    if (senderId === receiverId) return;

    await notificationModel.createNotification({
      receiverId,
      senderId,
      type:     'like',
      message:  'Le dio me gusta a tu publicación',
      itemId,
      itemType
    });
  }

  //  NOTIFICACIÓN DE COMENTARIO 
  //  cuando alguien comenta
  async notifyComment(senderId, receiverId, itemId, itemType) {
    if (senderId === receiverId) return;

    await notificationModel.createNotification({
      receiverId,
      senderId,
      type:     'comment',
      message:  'Comentó en tu publicación',
      itemId,
      itemType
    });
  }

  //  NOTIFICACIÓN DE RESPUESTA 
  //  cuando alguien responde un comentario
  async notifyReply(senderId, receiverId, itemId, itemType) {
    if (senderId === receiverId) return;

    await notificationModel.createNotification({
      receiverId,
      senderId,
      type:     'reply',
      message:  'Respondió tu comentario',
      itemId,
      itemType
    });
  }

  //  NOTIFICACIÓN DE ENVÍO 
  //  cuando el colaborador actualiza el estado del envío
  async notifyShipmentUpdate(receiverId, shipmentStatus, trackingCode) {

    // Mensaje según el estado del envío
    const statusMessages = {
      preparing:  'Tu pedido está siendo preparado',
      shipped:    'Tu pedido ha sido enviado',
      in_transit: `Tu pedido está en camino — Código: ${trackingCode}`,
      delivered:  'Tu pedido ha sido entregado',
      returned:   'Tu pedido fue devuelto'
    };

    await notificationModel.createNotification({
      receiverId,
      senderId:  null, // Es una notificación del sistema
      type:      'shipment',
      message:   statusMessages[shipmentStatus] || 'Actualización de tu envío',
      itemType:  'shipment'
    });
  }

  //  NOTIFICACIÓN DE NUEVO CONTENIDO 
  // cuando un colaborador publica contenido nuevo
  async notifyNewContent(senderId, receiverIds, contentId, contentTitle) {
    // receiverIds es un array — notificamos a varios usuarios a la vez
    const notifications = receiverIds.map(receiverId => {
      if (receiverId === senderId) return null;
      return notificationModel.createNotification({
        receiverId,
        senderId,
        type:     'new_content',
        message:  `Publicó nuevo contenido: ${contentTitle}`,
        itemId:   contentId,
        itemType: 'content'
      });
    }).filter(Boolean); // Filtramos los null

    // Creamos todas las notificaciones en paralelo
    await Promise.all(notifications);
  }

  //  NOTIFICACIÓN DE NUEVO PRODUCTO    
  // c uando un colaborador publica un producto nuevo
  async notifyNewProduct(senderId, receiverIds, productId, productName) {
    const notifications = receiverIds.map(receiverId => {
      if (receiverId === senderId) return null;
      return notificationModel.createNotification({
        receiverId,
        senderId,
        type:     'new_product',
        message:  `Publicó un nuevo producto: ${productName}`,
        itemId:   productId,
        itemType: 'product'
      });
    }).filter(Boolean);

    await Promise.all(notifications);
  }
}

module.exports = new NotificationService();