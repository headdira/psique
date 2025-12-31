import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../src/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20, // Ajuste para StatusBar
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
  },
  listContent: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    // Sombra leve
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chatInfo: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  time: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  lastMsg: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  badge: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: 40,
  }
});