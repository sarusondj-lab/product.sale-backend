import Product from "../models/product.js";
import User from "../models/user.js"; 
import { translate } from "@vitalets/google-translate-api";

// --- TRANSLATION HELPER ---
async function getAutoTranslations(text) {
  if (!text || text.trim() === "") return { hindi: "", kannada: "" };
  try {
    const hindiRes = await translate(text, { to: "hi" });
    const kannadaRes = await translate(text, { to: "kn" });
    return { hindi: hindiRes.text, kannada: kannadaRes.text };
  } catch (error) {
    console.error("Translation API failed:", error.message);
    return { hindi: text, kannada: text }; 
  }
}

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
};

export const addProduct = async (req, res) => {
  try {
    console.log("--- NEW UPLOAD ATTEMPT ---");
    console.log("BODY RECEIVED:", req.body);
    console.log("FILES RECEIVED:", req.files);
    const { name, price, description } = req.body;
    
    // --- FIX APPLIED HERE: Grabbing 'secure_url' instead of 'path' ---
    const images = req.files?.map(file => file.secure_url) || [];

    const translations = await getAutoTranslations(description);

    const product = new Product({
      name,
      price,
      description,
      descriptionHindi: translations.hindi,
      descriptionKannada: translations.kannada,
      images,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    // 👇 FIX: Forcing the server to print the exact reason it crashed
    console.error("🚨 THE REAL ERROR CAUSING 500:", err); 
    res.status(500).json({ message: "Error adding product", details: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, existingImages } = req.body;

    let finalImages = existingImages ? JSON.parse(existingImages) : [];
    if (req.files && req.files.length > 0) {
      // --- FIX APPLIED HERE: Grabbing 'secure_url' instead of 'path' ---
      const newImagePaths = req.files.map(file => file.secure_url);
      finalImages = [...finalImages, ...newImagePaths];
    }

    const updateData = { name, price, description, images: finalImages };

    if (description) {
      const translations = await getAutoTranslations(description);
      updateData.descriptionHindi = translations.hindi;
      updateData.descriptionKannada = translations.kannada;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
};

// --- SOCIAL FEATURES ---

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const hasLiked = product.likes.includes(userId);
    if (hasLiked) {
      product.likes = product.likes.filter((likeId) => likeId.toString() !== userId);
    } else {
      product.likes.push(userId);
    }
    await product.save();
    res.json({ message: "Like updated", likes: product.likes });
  } catch (error) {
    res.status(500).json({ message: "Error updating like" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, text } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const newComment = { userId, userName, text, isPinned: false };
    
    product.comments.push(newComment);
    await product.save();
    
    const savedComment = product.comments[product.comments.length - 1];
    res.status(201).json({ message: "Comment added", comment: savedComment });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment" });
  }
};

export const addAdminReply = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { adminReply } = req.body;
    
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const comment = product.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.adminReply = adminReply;
    await product.save();

    try {
      const userToNotify = await User.findById(comment.userId);
      if (userToNotify) {
        userToNotify.notifications.push({
          message: `The Admin replied to your comment on "${product.name}"!`,
          productId: product._id
        });
        await userToNotify.save();
      }
    } catch (notifyErr) {
      console.error("Failed to send notification", notifyErr);
    }

    res.json({ message: "Admin reply added", comments: product.comments });
  } catch (error) {
    res.status(500).json({ message: "Error adding reply" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { userId, isAdmin } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const comment = product.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await product.save();
    res.json({ message: "Comment deleted", comments: product.comments });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment" });
  }
};

export const togglePinComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { isAdmin } = req.body;

    if (!isAdmin) return res.status(403).json({ message: "Not authorized to pin comments" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const comment = product.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.isPinned = !comment.isPinned;
    await product.save();
    res.json({ message: comment.isPinned ? "Comment Pinned" : "Comment Unpinned", comments: product.comments });
  } catch (error) {
    res.status(500).json({ message: "Error pinning comment" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const notifications = user.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications.forEach(n => n.isRead = true);
    await user.save();
    
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications = user.notifications.filter(
      (n) => n._id.toString() !== notificationId
    );
    
    await user.save();
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting notification" });
  }
};

export const markSingleNotificationRead = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const notification = user.notifications.id(notificationId);
    if (notification) {
      notification.isRead = true;
      await user.save();
    }
    
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications = []; 
    await user.save();
    
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Error clearing notifications" });
  }
};