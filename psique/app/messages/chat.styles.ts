import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../src/theme';

export const BrandColors = {
  green: '#5FF0A9',
  offWhite: '#F5F4F2',
  white: '#FFFFFF',
  black: '#0E0E0E',
  gray: '#888888',
  lightGray: '#E5E5E5',
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  container: {
    flex: 1,
    backgroundColor: BrandColors.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.lightGray,
    zIndex: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.black,
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    width: '100%',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: BrandColors.green,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.lightGray,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: BrandColors.white,
  },
  theirMessageText: {
    color: BrandColors.black,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirMessageTime: {
    color: BrandColors.gray,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: BrandColors.white,
    borderTopWidth: 1,
    borderTopColor: BrandColors.lightGray,
  },
  input: {
    flex: 1,
    backgroundColor: BrandColors.offWhite,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    color: BrandColors.black,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
});