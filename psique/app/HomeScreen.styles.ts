import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../src/theme/index';

export const BrandColors = {
  black: '#0E0E0E',
  gray: '#2B2B2B',
  offWhite: '#F5F4F2',
  green: '#5FF0A9',
  peach: '#2B2B2B',
  lilac: '#2B2B2B',
  blue: '#6E8AFF',
  coral: '#FF6B8B',
  teal: '#2EE6CA'
};

export const styles = StyleSheet.create({
  // === LAYOUT & LOADER ===
  container: { 
    flex: 1, 
    backgroundColor: BrandColors.offWhite 
  },
  loadingScreen: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: BrandColors.offWhite 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: BrandColors.gray 
  },
  
  // === HEADER ===
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10 
  },
  logo: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: BrandColors.black, 
    fontFamily: 'Montserrat-Bold', 
    letterSpacing: -0.5
  },
  profileButton: { 
    padding: 4 
  },
  profileAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: BrandColors.green, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: BrandColors.lilac + '30'
  },
  profileAvatarImage: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: BrandColors.lilac + '30'
  },
  profileInitial: { 
    color: Colors.white, 
    fontSize: 18, 
    fontWeight: '700' 
  },
  
  // === TABS ===
  tabsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderBottomColor: BrandColors.gray + '20'
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6, 
    paddingVertical: 8, 
    borderRadius: 8
  },
  tabActive: { 
    backgroundColor: BrandColors.green + '15'
  },
  tabText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: BrandColors.gray 
  },
  tabTextActive: { 
    color: BrandColors.green, 
    fontWeight: '700' 
  },
  
  // === FILTROS ===
  filterSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12 
  },
  filterToggle: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    padding: 8, 
    backgroundColor: BrandColors.green + '15', 
    borderRadius: 8 
  },
  filterToggleText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: BrandColors.green 
  },
  clearFilterButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    backgroundColor: BrandColors.lilac + '15', 
    borderRadius: 6 
  },
  clearFilterText: { 
    fontSize: 13, 
    fontWeight: '500', 
    color: BrandColors.lilac 
  },
  filtersContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 16,
    backgroundColor: BrandColors.offWhite 
  },
  filterInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: BrandColors.gray + '10', 
    borderRadius: 8,
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    marginBottom: 8 
  },
  filterInput: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 14,
    color: BrandColors.black, 
    padding: 0 
  },
  typeChips: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginTop: 8 
  },
  typeChip: { 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    backgroundColor: BrandColors.gray + '10', 
    borderRadius: 20 
  },
  typeChipActive: { 
    backgroundColor: BrandColors.lilac 
  },
  typeChipText: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: BrandColors.gray 
  },
  typeChipTextActive: { 
    color: Colors.white 
  },
  
  // === FEED & SEÇÕES ===
  feed: { 
    flex: 1 
  },
  greeting: { 
    paddingHorizontal: 20, 
    paddingVertical: 20 
  },
  greetingText: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: BrandColors.black,
    marginBottom: 4, 
    fontFamily: 'Montserrat-Bold' 
  },
  greetingSub: { 
    fontSize: 16, 
    color: BrandColors.lilac, 
    fontWeight: '500'
  },
  
  // === TITULOS DE SEÇÃO COMPARTILHADOS ===
  // (Aqui removemos as duplicatas)
  datesSection: { 
    paddingHorizontal: 20, 
    paddingBottom: 100 
  },
  infoSection: { 
    marginHorizontal: 20, 
    marginBottom: 24 
  },
  submissionsSection: { 
    marginHorizontal: 20, 
    marginBottom: 24 
  },
  participationSection: { 
    marginHorizontal: 20, 
    marginBottom: 24 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 // Unificado
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: BrandColors.black,
    marginBottom: 12, // Unificado
    fontFamily: 'Montserrat-Bold' 
  },
  sectionSubtitle: { 
    fontSize: 14, 
    color: BrandColors.lilac, // Cor unificada (era green em um, lilac em outro)
    fontWeight: '500'
  },

  // === QUICK ACTIONS ===
  quickActions: { 
    flexDirection: 'row', 
    paddingHorizontal: 20,
    marginBottom: 24, 
    gap: 16 
  },
  quickAction: { 
    alignItems: 'center', 
    flex: 1 
  },
  quickIcon: { 
    width: 56, 
    height: 56, 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center', 
    marginBottom: 8 
  },
  quickLabel: { 
    fontSize: 13, 
    color: BrandColors.black, 
    fontWeight: '600' 
  },
  
  // === DATE CARD ===
  dateCard: {
    backgroundColor: Colors.white, 
    borderRadius: 16,
    overflow: 'hidden', 
    marginBottom: 16,
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20',
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: BrandColors.offWhite
  },
  dateBadge: { 
    alignItems: 'flex-start' 
  },
  dateDay: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: BrandColors.black,
    textTransform: 'uppercase'
  },
  dateTime: { 
    fontSize: 13, 
    color: BrandColors.lilac, 
    marginTop: 2 
  },
  userStatusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  userStatusText: { 
    fontSize: 11, 
    fontWeight: '600', 
    textTransform: 'uppercase' 
  },
  imageContainer: { 
    position: 'relative' 
  },
  cardImage: { 
    width: '100%', 
    height: 180 
  },
  typeBadge: { 
    position: 'absolute', 
    top: 12, 
    left: 12,
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    backgroundColor: BrandColors.black + 'CC', 
    paddingHorizontal: 10,
    paddingVertical: 6, 
    borderRadius: 20 
  },
  typeText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: Colors.white 
  },
  cardContent: { 
    padding: 16 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    marginBottom: 8 
  },
  locationText: { 
    fontSize: 13, 
    color: BrandColors.lilac 
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: BrandColors.black, 
    marginBottom: 8 
  },
  cardDescription: { 
    fontSize: 15, 
    color: BrandColors.gray, 
    lineHeight: 22, 
    marginBottom: 16 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  vibeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    backgroundColor: BrandColors.lilac + '15', 
    borderRadius: 6 
  },
  vibeText: { 
    fontSize: 12, 
    color: BrandColors.lilac, 
    fontWeight: '500' 
  },
  participantInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  participantCount: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: BrandColors.black 
  },
  
  // === EMPTY STATE ===
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 60, 
    paddingHorizontal: 20 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: BrandColors.black,
    marginTop: 16, 
    marginBottom: 8 
  },
  emptyText: { 
    fontSize: 15, 
    color: BrandColors.gray, 
    textAlign: 'center', 
    marginBottom: 24, 
    lineHeight: 22 
  },
  createButton: { 
    backgroundColor: BrandColors.green, 
    paddingHorizontal: 28, 
    paddingVertical: 14, 
    borderRadius: 10 
  },
  createButtonText: { 
    color: Colors.white, 
    fontSize: 16, 
    fontWeight: '700' 
  },
  
  // === BOTTOM NAV ===
  bottomNav: { 
    flexDirection: 'row', 
    justifyContent: 'space-around',
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    borderTopWidth: 1, 
    borderTopColor: BrandColors.gray + '20',
    backgroundColor: Colors.white, 
    position: 'absolute',
    bottom: 0, 
    left: 0, 
    right: 0, 
    zIndex: 1000 
  },
  navItem: { 
    alignItems: 'center', 
    paddingHorizontal: 12 
  },
  navIconContainer: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 12 
  },
  navIconContainerActive: { 
    backgroundColor: BrandColors.green + '15' 
  },
  navLabel: { 
    fontSize: 11, 
    color: BrandColors.gray, 
    fontWeight: '500', 
    marginTop: 6 
  },
  navLabelActive: { 
    color: BrandColors.green, 
    fontWeight: '600' 
  },
  bottomSpacer: { 
    height: 100 
  },
  
  // === MODAL ===
  modalContainer: { 
    flex: 1, 
    backgroundColor: BrandColors.offWhite 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 16, 
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray + '20', 
    backgroundColor: Colors.white 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: BrandColors.black 
  },
  closeButton: { 
    padding: 4 
  },
  editHeaderButton: { 
    padding: 8 
  },
  
  // === DATE INFO (DETALHES) ===
  dateInfo: { 
    flex: 1, 
    paddingBottom: 20 
  },
  dateHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    padding: 20,
    backgroundColor: Colors.white, 
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray + '20'
  },
  dateTimeBadge: { 
    backgroundColor: BrandColors.green + '15', 
    paddingHorizontal: 12,
    paddingVertical: 8, 
    borderRadius: 8 
  },
  dateText: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: BrandColors.green 
  },
  timeText: { 
    fontSize: 13, 
    color: BrandColors.lilac, 
    marginTop: 2 
  },
  locationInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    flex: 1, 
    marginLeft: 12 
  },
  locationDetail: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    flex: 1 
  },
  detailTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: BrandColors.black, 
    marginHorizontal: 20, 
    marginVertical: 16 
  },
  detailDescription: { 
    fontSize: 16, 
    color: BrandColors.gray, 
    lineHeight: 24, 
    marginHorizontal: 20, 
    marginBottom: 24 
  },
  infoGrid: { 
    backgroundColor: Colors.white, 
    borderRadius: 16,
    padding: 16, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20'
  },
  infoItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12, 
    gap: 12 
  },
  infoLabel: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    fontWeight: '500', 
    minWidth: 80 
  },
  infoValue: { 
    fontSize: 14, 
    color: BrandColors.black, 
    flex: 1 
  },
  
  // === SUBMISSIONS & STATUS ===
  submissionsList: { 
    gap: 8 
  },
  submissionItem: { 
    backgroundColor: Colors.white, 
    borderRadius: 16,
    padding: 16, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20'
  },
  submissionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  submissionUser: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  userAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: BrandColors.lilac, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  userAvatarText: { 
    color: Colors.white, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  userName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: BrandColors.black 
  },
  submissionDate: { 
    fontSize: 12, 
    color: BrandColors.gray 
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  statusAccepted: { 
    backgroundColor: BrandColors.green + '20' 
  },
  statusRejected: { 
    backgroundColor: BrandColors.coral + '20' 
  },
  statusPending: { 
    backgroundColor: BrandColors.blue + '20' 
  },
  statusText: { 
    fontSize: 11, 
    fontWeight: '600', 
    textTransform: 'uppercase' 
  },
  submissionMessage: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    fontStyle: 'italic', 
    marginBottom: 8, 
    lineHeight: 20 
  },
  submissionActions: { 
    flexDirection: 'row', 
    gap: 8, 
    marginTop: 8 
  },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8, 
    gap: 4, 
    flex: 1 
  },
  acceptButton: { 
    backgroundColor: BrandColors.green 
  },
  actionButtonText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: Colors.white 
  },
  chatButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: BrandColors.green, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8, 
    gap: 6, 
    marginTop: 8 
  },
  chatButtonText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: Colors.white 
  },
  emptySubmissions: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    textAlign: 'center',
    padding: 20, 
    backgroundColor: Colors.white, 
    borderRadius: 16,
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20'
  },
  
  // === CARDS DE STATUS DO USUÁRIO ===
  statusCardAccepted: { 
    flexDirection: 'row', 
    backgroundColor: BrandColors.green + '10',
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: BrandColors.green, 
    gap: 12 
  },
  statusCardPending: { 
    flexDirection: 'row', 
    backgroundColor: BrandColors.blue + '10',
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: BrandColors.blue, 
    gap: 12 
  },
  statusCardRejected: { 
    flexDirection: 'row', 
    backgroundColor: BrandColors.coral + '10',
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: BrandColors.coral, 
    gap: 12 
  },
  statusContent: { 
    flex: 1 
  },
  statusTitleAccepted: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: BrandColors.green, 
    marginBottom: 4 
  },
  statusTitlePending: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: BrandColors.blue, 
    marginBottom: 4 
  },
  statusTitleRejected: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: BrandColors.coral, 
    marginBottom: 4 
  },
  statusMessage: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    lineHeight: 20 
  },
  cancelSubmissionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    marginTop: 8, 
    paddingVertical: 4 
  },
  cancelSubmissionText: { 
    fontSize: 14, 
    color: BrandColors.coral, 
    fontWeight: '500' 
  },
  
  // === FORMULARIO DE SUBMISSÃO ===
  submissionForm: { 
    backgroundColor: Colors.white, 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20' 
  },
  submissionHint: { 
    fontSize: 14, 
    color: BrandColors.lilac, 
    marginBottom: 12 
  },
  messageInput: { 
    backgroundColor: BrandColors.gray + '10', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 15, 
    color: BrandColors.black, 
    minHeight: 100, 
    textAlignVertical: 'top', 
    marginBottom: 8 
  },
  charCount: { 
    fontSize: 12, 
    color: BrandColors.gray, 
    textAlign: 'right' 
  },
  submitButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: BrandColors.green, 
    paddingVertical: 14, 
    borderRadius: 8, 
    gap: 8, 
    marginTop: 16 
  },
  submitButtonText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: Colors.white 
  },
  
  // === EDIT FORM ===
  editForm: { 
    flex: 1, 
    padding: 20, 
    paddingBottom: 40 
  },
  formGroup: { 
    marginBottom: 16 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: BrandColors.black, 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: Colors.white, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '30',
    borderRadius: 8, 
    padding: 12, 
    fontSize: 15, 
    color: BrandColors.black 
  },
  hint: { 
    fontSize: 12, 
    color: BrandColors.gray, 
    marginTop: 4 
  },
  optionsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  optionButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8,
    backgroundColor: Colors.white, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '30' 
  },
  optionButtonActive: { 
    backgroundColor: BrandColors.green, 
    borderColor: BrandColors.green 
  },
  optionText: { 
    fontSize: 13, 
    color: BrandColors.gray, 
    fontWeight: '500' 
  },
  optionTextActive: { 
    color: Colors.white 
  },
  editActions: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 24 
  },
  editButton: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  cancelEditButton: { 
    backgroundColor: Colors.white, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '30' 
  },
  cancelEditText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: BrandColors.black 
  },
  saveButton: { 
    backgroundColor: BrandColors.green 
  },
  saveText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: Colors.white 
  },
  
  // === CHAT PROMPT ===
  chatPrompt: { 
    margin: 20, 
    backgroundColor: Colors.white, 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: BrandColors.gray + '20',
    shadowColor: BrandColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3 
  },
  chatPromptContent: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 12, 
    marginBottom: 16 
  },
  chatPromptTextContainer: { 
    flex: 1 
  },
  chatPromptTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: BrandColors.black, 
    marginBottom: 4 
  },
  chatPromptMessage: { 
    fontSize: 14, 
    color: BrandColors.gray, 
    lineHeight: 20 
  },
  chatPromptButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: BrandColors.lilac, 
    paddingVertical: 14, 
    borderRadius: 8, 
    gap: 8 
  },
  chatPromptButtonText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: Colors.white 
  },
});