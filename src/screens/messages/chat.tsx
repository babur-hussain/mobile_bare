import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { APP_COLORS } from '../../constants/colors';
import { messagesService, Conversation, Message } from '../../services/messages.service';
import { socketService } from '../../services/socket.service';

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    let h = d.getHours();
    let m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const minStr = m < 10 ? '0' + m : m.toString();
    return `${h}:${minStr} ${ampm}`;
  } catch (e) {
    return '';
  }
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { conversationId, platform, accountId, recipientId } = route.params;

  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      const data = await messagesService.getConversationById(platform, accountId, conversationId);
      setMessages(data);
    } catch(e) { }
  };

  useEffect(() => {
    // Make sure we are registered to receive this account's messages
    socketService.registerAccount(accountId);

    const handleNewMessage = (msg: any) => {
      // Only add to this chat if it belongs to this conversation
      // (msg.accountId is guaranteed to match, we just need to verify it's the right sender/recipient)
      if (
        (msg.senderId === recipientId && msg.recipientId === accountId) ||
        (msg.senderId === accountId && msg.recipientId === recipientId)
      ) {
        setMessages(prev => {
          // Prevent duplicates if REST API and WebSocket arrive at the same time
          if (prev.some(m => m.id === msg.messageId)) return prev;

          const newMsg: Message = {
            id: msg.messageId,
            text: msg.text,
            sender: msg.senderId === accountId ? 'me' : 'them',
            timestamp: msg.timestamp,
          };
          return [...prev, newMsg];
        });
      }
    };

    socketService.onNewMessage(handleNewMessage);
    return () => socketService.offNewMessage(handleNewMessage);
  }, [accountId, recipientId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');

    // Optimistic UI update
    const optimisticMsg: Message = {
      id: 'temp-' + Date.now(),
      text: textToSend,
      sender: 'me',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    
    // Real save
    try {
      const newMsg = await messagesService.sendMessage(platform, accountId, conversationId, recipientId, textToSend);
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? newMsg : m));
    } catch(err) {
      // Revert if error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={APP_COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Thread</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => {
            const isMe = msg.sender === 'me';
            return (
              <View key={msg.id || index} style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
                <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
                  {msg.text}
                </Text>
                <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.outlineVariant,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: APP_COLORS.onSurface,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageMe: {
    alignSelf: 'flex-end',
    backgroundColor: APP_COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageThem: {
    alignSelf: 'flex-start',
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTextThem: {
    color: APP_COLORS.onSurface,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeThem: {
    color: APP_COLORS.onSurfaceVariant,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.outlineVariant,
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: APP_COLORS.surfaceContainerHighest,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: APP_COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
