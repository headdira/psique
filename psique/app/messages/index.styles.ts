import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../src/theme';

// Cores do projeto para usar diretamente
const BrandColors = {
  green: '#5FF0A9',
  offWhite: '#F5F4F2',
  white: '#FFFFFF',
  black: '#0E0E0E',
  gray: '#888888',
  lightGray: '#E5E5E5',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColors.offWhite,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BrandColors.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    paddingBottom: 16,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButtonContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 16,
    minWidth: 60,
    alignItems: 'flex-start',
  },
  backButtonContent: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.black,
    textAlign: 'center',
  },
  updatingIndicator: {
    marginLeft: 8,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateButtonContainer: {
    padding: 8,
  },
  updateButtonContent: {
    padding: 4,
  },
  refreshButtonContainer: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 16,
  },
  refreshButtonContent: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BrandColors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BrandColors.white,
  },
  genericIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: BrandColors.green,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.white,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.black,
    flex: 1,
  },
  refreshNameButton: {
    padding: 4,
    marginLeft: 4,
  },
  time: {
    fontSize: 12,
    color: BrandColors.gray,
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: BrandColors.gray,
  },
  badge: {
    backgroundColor: BrandColors.green,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: BrandColors.white,
    paddingHorizontal: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: BrandColors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: BrandColors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  updatingNamesHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(95, 240, 169, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  updatingNamesText: {
    fontSize: 12,
    color: BrandColors.green,
    marginLeft: 8,
  },
});

// Exportar BrandColors também se necessário em outros lugares
export { BrandColors };